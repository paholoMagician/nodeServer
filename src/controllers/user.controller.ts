import { Request, Response } from 'express';
import { findUserByUsername, updateUser } from '../models/user.model';
import pool from '../database/database';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

const hashPassword = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, username, profile_picture FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        const { username, password } = req.body;

        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const updateData: any = { username };
        if (password) {
            updateData.password = hashPassword(password);
        }

        await updateUser(userId, updateData);
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        // The file path is relative to wwwroot
        // req.file.path will be something like "wwwroot\storage\perfil\filename.png"
        // We want to store "storage/perfil/filename.png" in the DB
        const relativePath = req.file.path.replace('wwwroot\\', '').replace('wwwroot/', '').replace(/\\/g, '/');

        await updateUser(userId, { profile_picture: relativePath });
        res.status(200).json({ message: 'Profile picture uploaded successfully', path: relativePath });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
