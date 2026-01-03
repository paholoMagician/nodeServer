import { Request, Response } from 'express';
import { getOnlineUsers as getOnlineUsersModel } from '../models/user.model';
import { createMessage, getChatHistory as getChatHistoryModel, deleteMessage as deleteMessageModel } from '../models/message.model';

export const getOnlineUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await getOnlineUsersModel();
        res.status(200).json(users);
    } catch (error) {
        console.error('Get online users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { from_user_id, to_user_id, content } = req.body;
        if (!from_user_id || !to_user_id || !content) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const messageId = await createMessage({ from_user_id, to_user_id, content });
        res.status(201).json({ message: 'Message sent', messageId });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId1 = parseInt(req.params.userId1);
        const userId2 = parseInt(req.params.userId2);

        if (isNaN(userId1) || isNaN(userId2)) {
            res.status(400).json({ message: 'Invalid user IDs' });
            return;
        }

        const messages = await getChatHistoryModel(userId1, userId2);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const messageId = parseInt(req.params.id);
        const userId = (req as any).user.id; // From JWT middleware

        if (isNaN(messageId)) {
            res.status(400).json({ message: 'Invalid message ID' });
            return;
        }

        const success = await deleteMessageModel(messageId, userId);
        if (success) {
            res.status(200).json({ message: 'Message deleted' });
        } else {
            res.status(404).json({ message: 'Message not found or not authorized' });
        }
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
