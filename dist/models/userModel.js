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
const database_1 = __importDefault(require("../database/database"));
exports.default = {
    // CREATE
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield database_1.default.execute('INSERT INTO users (nombre, email, password, estado, rol) VALUES (?, ?, ?, ?, ?)', [user.nombre, user.email, user.password, user.estado, user.rol]);
            return result;
        });
    },
    // READ (all)
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.query('SELECT * FROM users');
            return rows;
        });
    },
    // READ (by id)
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.query('SELECT * FROM users WHERE idusers = ?', [id]);
            return rows;
        });
    },
    // UPDATE
    updateUser(id, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield database_1.default.query('UPDATE users SET nombre = ?, email = ?, estado = ?, rol = ? WHERE idusers = ?', [user.nombre, user.email, user.estado, user.rol, id]);
            return result;
        });
    },
    // DELETE (soft delete)
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield database_1.default.query('UPDATE users SET estado = 0 WHERE idusers = ?', [id]);
            return result;
        });
    },
    // Validar credenciales
    validateCredentials(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield database_1.default.query('SELECT * FROM users WHERE email = ? AND password = ? AND estado = 1', [email, password]);
            return rows;
        });
    }
};
