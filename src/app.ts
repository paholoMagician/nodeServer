import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import testRoutes from './routes/routes';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';
import { createMessage } from './models/message.model';
import { updateUserStatus } from './models/user.model';

const app = express();
// ✅ Cambio para despliegue en la nube
const PORT = process.env.PORT || 6567;

app.use(cors());
app.use(express.json());
// Serve static files from wwwroot
app.use(express.static('wwwroot'));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Socket.io Logic
io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async (userId: number) => {
        if (!userId) return;
        socket.join(userId.toString());
        (socket as any).userId = userId;

        await updateUserStatus(userId, true);
        io.emit('userStatus', { userId, isOnline: true });
        console.log(`User ${userId} joined and online`);
    });

    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, message } = data;
        try {
            const messageId = await createMessage({
                from_user_id: senderId,
                to_user_id: receiverId,
                content: message
            });

            const payload = {
                id: messageId,
                sender_id: senderId,
                message: message,
                created_at: new Date()
            };

            // Enviar a ambos (Emisor y Receptor)
            io.to(receiverId.toString()).emit('receiveMessage', payload);
            io.to(senderId.toString()).emit('receiveMessage', payload);

        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('deleteMessage', (data) => {
        const { messageId, receiverId, senderId } = data;
        // Broadcast to receiver and sender
        io.to(receiverId.toString()).emit('messageDeleted', { messageId });
        io.to(senderId.toString()).emit('messageDeleted', { messageId });
    });

    socket.on('disconnect', async () => {
        const userId = (socket as any).userId;
        if (userId) {
            await updateUserStatus(userId, false);
            io.emit('userStatus', { userId, isOnline: false });
            console.log(`User ${userId} marked offline`);
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://152.53.89.82:${PORT}`);
    console.log(`📝 Test the API with Postman: GET http://152.53.89.82:${PORT}/api/test`);
});

// ✅ Evita bloqueos de puerto
process.on('SIGINT', () => httpServer.close());