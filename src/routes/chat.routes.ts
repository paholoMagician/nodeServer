import { Router } from 'express';
import { getOnlineUsers, sendMessage, getChatHistory } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/users/online', authenticateToken, getOnlineUsers);
router.post('/messages', authenticateToken, sendMessage);
router.get('/messages/:userId1/:userId2', authenticateToken, getChatHistory);

export default router;
