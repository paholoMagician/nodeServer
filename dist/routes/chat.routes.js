"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
router.get('/users/online', chat_controller_1.getOnlineUsers);
router.post('/messages', chat_controller_1.sendMessage);
router.get('/messages/:userId1/:userId2', chat_controller_1.getChatHistory);
exports.default = router;
