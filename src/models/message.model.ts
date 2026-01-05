import pool from '../database/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Message {
    id?: number;
    from_user_id: number;
    to_user_id: number;
    content: string;
    file_url?: string | null;
    created_at?: Date;
}

export const createMessage = async (message: Message): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO messages (from_user_id, to_user_id, content, file_url) VALUES (?, ?, ?, ?)',
        [message.from_user_id, message.to_user_id, message.content, message.file_url || null]
    );
    return result.insertId;
};

export const getChatHistory = async (userId1: number, userId2: number): Promise<Message[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM messages 
         WHERE (from_user_id = ? AND to_user_id = ?) 
            OR (from_user_id = ? AND to_user_id = ?) 
         ORDER BY created_at ASC`,
        [userId1, userId2, userId2, userId1]
    );
    return rows as Message[];
};

export const deleteMessage = async (messageId: number, userId: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM messages WHERE id = ? AND from_user_id = ?',
        [messageId, userId]
    );
    return result.affectedRows > 0;
};
