import pool from '../database/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Group {
    id?: number;
    name: string;
    description?: string;
    group_image?: string;
    created_by: number;
    created_at?: Date;
}

export interface GroupMember {
    id?: number;
    group_id: number;
    user_id: number;
    role: 'admin' | 'member';
    joined_at?: Date;
}

export const createGroup = async (group: Group): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO chat_groups (name, description, group_image, created_by) VALUES (?, ?, ?, ?)',
        [group.name, group.description || null, group.group_image || 'default_group.png', group.created_by]
    );
    return result.insertId;
};

export const addMember = async (groupId: number, userId: number, role: 'admin' | 'member' = 'member'): Promise<boolean> => {
    try {
        await pool.query<ResultSetHeader>(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
            [groupId, userId, role]
        );
        return true;
    } catch (error) {
        console.error('Add member error:', error);
        return false;
    }
};

export const getGroupsByUser = async (userId: number): Promise<any[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT g.*, gm.role 
         FROM chat_groups g
         JOIN group_members gm ON g.id = gm.group_id
         WHERE gm.user_id = ?`,
        [userId]
    );
    return rows;
};

export const getGroupMembers = async (groupId: number): Promise<any[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT u.id, u.username, u.profile_picture, gm.role 
         FROM users u
         JOIN group_members gm ON u.id = gm.user_id
         WHERE gm.group_id = ?`,
        [groupId]
    );
    return rows;
};
