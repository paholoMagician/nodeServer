import { Router } from 'express';
import { getOnlineUsers, sendMessage, getChatHistory, deleteMessage, uploadChatFile } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Multer Config for Chat
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'wwwroot/storage/chat';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Filenames are already trimmed on frontend, but we add unik suffix here
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed') as any, false);
        }
    }
});

router.get('/users/online', authenticateToken, getOnlineUsers);
router.post('/messages', authenticateToken, sendMessage);
router.get('/messages/:userId1/:userId2', authenticateToken, getChatHistory);
router.delete('/messages/:id', authenticateToken, deleteMessage);
router.post('/upload', authenticateToken, upload.single('file'), uploadChatFile);

export default router;
