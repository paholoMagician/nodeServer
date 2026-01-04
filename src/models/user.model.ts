import pool from '../database/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
    id?: number;
    username: string;
    password?: string;
    profile_picture?: string;
    is_online?: boolean;
    created_at?: Date;
    estado_terminos_condiciones?: boolean;
}

export const createUser = async (user: User): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO users (username, password, estado_terminos_condiciones) VALUES (?, ?, ?)',
        [user.username, user.password, user.estado_terminos_condiciones || false]
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
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, username, is_online, created_at, profile_picture FROM users ORDER BY is_online DESC, username ASC');
    return rows as User[];
};

export const updateUser = async (userId: number, user: Partial<User>): Promise<void> => {
    const fields: string[] = [];
    const values: any[] = [];

    if (user.username) {
        fields.push('username = ?');
        values.push(user.username);
    }
    if (user.password) {
        fields.push('password = ?');
        values.push(user.password);
    }
    if (user.profile_picture) {
        fields.push('profile_picture = ?');
        values.push(user.profile_picture);
    }

    if (fields.length === 0) return;

    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
};
