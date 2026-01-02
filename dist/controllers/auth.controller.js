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
exports.logout = exports.login = exports.register = void 0;
const user_model_1 = require("../models/user.model");
const crypto_1 = __importDefault(require("crypto"));
const hashPassword = (password) => {
    return crypto_1.default.createHash('sha256').update(password).digest('hex');
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }
        const existingUser = yield (0, user_model_1.findUserByUsername)(username);
        if (existingUser) {
            res.status(409).json({ message: 'Username already exists' });
            return;
        }
        const hashedPassword = hashPassword(password);
        const userId = yield (0, user_model_1.createUser)({ username, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', userId });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }
        const user = yield (0, user_model_1.findUserByUsername)(username);
        if (!user || user.password !== hashPassword(password)) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        if (user.id) {
            yield (0, user_model_1.updateUserStatus)(user.id, true);
        }
        res.status(200).json({ message: 'Login successful', userId: user.id, username: user.username });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ message: 'UserId is required' });
            return;
        }
        yield (0, user_model_1.updateUserStatus)(userId, false);
        res.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.logout = logout;
