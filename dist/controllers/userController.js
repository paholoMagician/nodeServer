"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../config/auth");
const userModel_1 = __importDefault(require("../models/userModel"));
const logger_plugin_1 = require("../plugin/logger.plugin");
const logger = (0, logger_plugin_1.buildLogger)('user-controller');
exports.default = {
    // CREATE USER
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = yield this.parseRequestBody(req);
                const userData = this.validateUserData(body);
                // Hash password antes de guardar
                const salt = yield bcryptjs_1.default.genSalt(10);
                // const hashedPassword = await bcrypt.hash(userData.password, salt);
                const newUser = {
                    nombre: userData.nombre,
                    email: userData.email,
                    password: userData.password,
                    estado: 1, // Activo por defecto
                    rol: userData.rol || 'USR' // Rol por defecto
                };
                const result = yield userModel_1.default.createUser(newUser);
                this.sendResponse(res, 201, {
                    success: true,
                    data: result
                });
            }
            catch (error) {
                logger.error(`Error creating user: ${error}`);
                this.handleError(res, error);
            }
        });
    },
    // LOGIN
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = yield this.parseRequestBody(req);
                const { email, password } = body;
                if (!email || !password) {
                    throw new Error('Email y contraseña son requeridos');
                }
                logger.log(`Login attempt for: ${email}`);
                // Buscar usuario
                const users = yield userModel_1.default.getByEmail(email);
                const user = users[0];
                if (!user)
                    throw new Error('Credenciales inválidas');
                if (password != user.password)
                    throw new Error('Contraseña incorrecta');
                // Verificar contraseña
                // const isMatch = await bcrypt.compare(password, user.password);
                // if (!isMatch) throw new Error('Credenciales inválidas');
                // Generar tokens
                const token = jsonwebtoken_1.default.sign({ userId: user.idusers, email: user.email, rol: user.rol }, auth_1.AuthConfig.JWT.SECRET, { expiresIn: auth_1.AuthConfig.JWT.EXPIRES_IN });
                const refreshToken = jsonwebtoken_1.default.sign({ userId: user.idusers }, auth_1.AuthConfig.JWT.REFRESH_SECRET, { expiresIn: auth_1.AuthConfig.JWT.REFRESH_EXPIRES_IN });
                // Excluir password en la respuesta
                const { password: _ } = user, userData = __rest(user, ["password"]);
                this.sendResponse(res, 200, {
                    success: true,
                    data: {
                        user: userData,
                        token,
                        refreshToken,
                        expiresIn: auth_1.AuthConfig.JWT.EXPIRES_IN
                    }
                });
            }
            catch (error) {
                logger.error(`Login failed: ${error}`);
                this.handleError(res, error, 401);
            }
        });
    },
    // GET ALL USERS
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_1.default.getAllUsers();
                this.sendResponse(res, 200, {
                    success: true,
                    data: users
                });
            }
            catch (error) {
                logger.error(`Error getting users: ${error}`);
                this.handleError(res, error);
            }
        });
    },
    // GET USER BY ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.extractIdFromRequest(req);
                if (!id)
                    throw new Error('ID de usuario no proporcionado');
                const user = yield userModel_1.default.getUserById(id);
                if (!user) {
                    throw new Error('Usuario no encontrado');
                }
                this.sendResponse(res, 200, {
                    success: true,
                    data: user
                });
            }
            catch (error) {
                logger.error(`Error getting user: ${error}`);
                this.handleError(res, error);
            }
        });
    },
    // UPDATE USER
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.extractIdFromRequest(req);
                if (!id)
                    throw new Error('ID de usuario no proporcionado');
                const body = yield this.parseRequestBody(req);
                const updatedUser = this.validateUserData(body, false); // No requerir password para update
                const result = yield userModel_1.default.updateUser(id, updatedUser);
                this.sendResponse(res, 200, {
                    success: true,
                    data: result
                });
            }
            catch (error) {
                logger.error(`Error updating user: ${error}`);
                this.handleError(res, error);
            }
        });
    },
    // DELETE USER (soft delete)
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.extractIdFromRequest(req);
                if (!id)
                    throw new Error('ID de usuario no proporcionado');
                const result = yield userModel_1.default.deleteUser(id);
                this.sendResponse(res, 200, {
                    success: true,
                    data: result
                });
            }
            catch (error) {
                logger.error(`Error deleting user: ${error}`);
                this.handleError(res, error);
            }
        });
    },
    // UTILITY METHODS
    parseRequestBody(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', () => {
                    try {
                        resolve(body ? JSON.parse(body) : {});
                    }
                    catch (e) {
                        reject(new Error('Formato JSON inválido'));
                    }
                });
                req.on('error', reject);
            });
        });
    },
    validateUserData(data, requirePassword = true) {
        if (!data.nombre || !data.email || (requirePassword && !data.password)) {
            throw new Error('Datos de usuario incompletos');
        }
        return data;
    },
    extractIdFromRequest(req) {
        var _a, _b;
        const id = (_b = (_a = req.parsedUrl) === null || _a === void 0 ? void 0 : _a.pathname) === null || _b === void 0 ? void 0 : _b.split('/').pop();
        return id ? parseInt(id) : null;
    },
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    },
    handleError(res, error, statusCode = 500) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        logger.error(`Error: ${errorMessage}`);
        this.sendResponse(res, statusCode, {
            success: false,
            error: errorMessage
        });
    }
};
