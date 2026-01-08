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
exports.getOnlineUsers = exports.updateUserStatus = exports.findUserByUsername = exports.createUser = void 0;
const database_1 = __importDefault(require("../database/database"));
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield database_1.default.query('INSERT INTO users (username, password) VALUES (?, ?)', [user.username, user.password]);
    return result.insertId;
});
exports.createUser = createUser;
const findUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
        return rows[0];
    }
    return null;
});
exports.findUserByUsername = findUserByUsername;
const updateUserStatus = (userId, isOnline) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.query('UPDATE users SET is_online = ? WHERE id = ?', [isOnline, userId]);
});
exports.updateUserStatus = updateUserStatus;
const getOnlineUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield database_1.default.query('SELECT id, username, is_online, created_at FROM users WHERE is_online = TRUE');
    return rows;
});
exports.getOnlineUsers = getOnlineUsers;
