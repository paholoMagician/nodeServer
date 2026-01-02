import { Request, Response } from 'express';
import { createUser, findUserByUsername, updateUserStatus } from '../models/user.model';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key_here'; // In production, use environment variable

const hashPassword = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            res.status(409).json({ message: 'Username already exists' });
            return;
        }

        const hashedPassword = hashPassword(password);
        const userId = await createUser({ username, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }

        const user = await findUserByUsername(username);
        if (!user || user.password !== hashPassword(password)) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (user.id) {
            await updateUserStatus(user.id, true);
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', userId: user.id, username: user.username, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ message: 'UserId is required' });
            return;
        }

        await updateUserStatus(userId, false);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
