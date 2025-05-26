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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
exports.default = {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = yield this.parseRequestBody(req);
                const userData = this.validateUserData(body);
                const newUser = {
                    nombre: userData.nombre,
                    email: userData.email,
                    password: userData.password,
                    estado: 1, // Usuario activo por defecto
                    rol: userData.rol || 'USR', // Rol por defecto
                    perfilImagen: userData.perfilImagen
                };
                console.log('USUARIO ENVIADO');
                console.table(newUser);
                const result = yield userModel_1.default.createUser(newUser);
                this.sendResponse(res, 201, { success: true, data: result });
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
    },
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_1.default.getAllUsers();
                this.sendResponse(res, 200, { success: true, data: users });
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
    },
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = this.extractIdFromRequest(req);
                if (!id)
                    throw new Error('ID de usuario no proporcionado');
                const user = yield userModel_1.default.getUserById(id);
                if (!user) {
                    this.sendResponse(res, 404, { success: false, message: 'Usuario no encontrado' });
                    return;
                }
                this.sendResponse(res, 200, { success: true, data: user });
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
    },
    // Métodos utilitarios
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
    validateUserData(data) {
        if (!data.nombre || !data.email || !data.password) {
            throw new Error('Nombre, email y password son requeridos');
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
    handleError(res, error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
        this.sendResponse(res, statusCode, {
            success: false,
            error: errorMessage
        });
    }
};
