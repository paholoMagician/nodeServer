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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatHistory = exports.sendMessage = exports.getOnlineUsers = void 0;
const user_model_1 = require("../models/user.model");
const message_model_1 = require("../models/message.model");
const getOnlineUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, user_model_1.getOnlineUsers)();
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Get online users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getOnlineUsers = getOnlineUsers;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from_user_id, to_user_id, content } = req.body;
        if (!from_user_id || !to_user_id || !content) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const messageId = yield (0, message_model_1.createMessage)({ from_user_id, to_user_id, content });
        res.status(201).json({ message: 'Message sent', messageId });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.sendMessage = sendMessage;
const getChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId1 = parseInt(req.params.userId1);
        const userId2 = parseInt(req.params.userId2);
        if (isNaN(userId1) || isNaN(userId2)) {
            res.status(400).json({ message: 'Invalid user IDs' });
            return;
        }
        const messages = yield (0, message_model_1.getChatHistory)(userId1, userId2);
        res.status(200).json(messages);
    }
    catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getChatHistory = getChatHistory;
