import pool from '../database/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
    id?: number;
    username: string;
    password?: string;
    is_online?: boolean;
    created_at?: Date;
}

export const createUser = async (user: User): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [user.username, user.password]
    );
    return result.insertId;
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
        return rows[0] as User;
    }
    return null;
};

export const updateUserStatus = async (userId: number, isOnline: boolean): Promise<void> => {
    await pool.query('UPDATE users SET is_online = ? WHERE id = ?', [isOnline, userId]);
};

export const getOnlineUsers = async (): Promise<User[]> => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, username, is_online, created_at FROM users ORDER BY is_online DESC, username ASC');
    return rows as User[];
};
