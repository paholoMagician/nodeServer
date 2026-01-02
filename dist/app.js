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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const routes_1 = __importDefault(require("./routes/routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const message_model_1 = require("./models/message.model");
const user_model_1 = require("./models/user.model");
const app = (0, express_1.default)();
const PORT = 6567;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // Allow all for now
        methods: ["GET", "POST"]
    }
});
// Configuramos las rutas bajo el prefijo /api
app.use('/api', routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join', (userId) => __awaiter(void 0, void 0, void 0, function* () {
        if (!userId)
            return;
        socket.join(userId.toString());
        yield (0, user_model_1.updateUserStatus)(userId, true);
        io.emit('userStatus', { userId, isOnline: true });
        console.log(`User ${userId} joined`);
    }));
    socket.on('sendMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { senderId, receiverId, message } = data;
        try {
            // Save to DB
            const messageId = yield (0, message_model_1.createMessage)({
                from_user_id: senderId,
                to_user_id: receiverId,
                content: message
            });
            // Emit to receiver
            io.to(receiverId.toString()).emit('receiveMessage', {
                id: messageId,
                sender_id: senderId,
                message: message,
                created_at: new Date()
            });
            // Emit back to sender (so they see it immediately if not optimistic)
            io.to(senderId.toString()).emit('receiveMessage', {
                id: messageId,
                sender_id: senderId,
                message: message,
                created_at: new Date()
            });
        }
        catch (error) {
            console.error('Error sending message:', error);
        }
    }));
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Note: To mark offline on disconnect, we'd need to map socket.id to userId.
        // For now, we rely on manual logout or session expiry logic if added later.
    });
});
// Iniciamos el servidor
httpServer.listen(PORT, () => {
    console.log(`🚀 Ready server in http://localhost:${PORT}`);
    console.log(`🔍 Endpoint deploy in http://localhost:${PORT}/api/test`);
});
