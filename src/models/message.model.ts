import pool from '../database/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Message {
    id?: number;
    from_user_id: number;
    to_user_id: number;
    content: string;
    created_at?: Date;
}

export const createMessage = async (message: Message): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO messages (from_user_id, to_user_id, content) VALUES (?, ?, ?)',
        [message.from_user_id, message.to_user_id, message.content]
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
