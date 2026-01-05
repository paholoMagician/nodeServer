import { Request, Response } from 'express';
import * as GroupModel from '../models/group.model';

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, members } = req.body;
        const userId = (req as any).user.id; // From JWT middleware

        if (!name) {
            res.status(400).json({ status: 'error', message: 'Group name is required' });
            return;
        }

        const groupId = await GroupModel.createGroup({
            name,
            description,
            created_by: userId
        });

        // Add creator as admin
        await GroupModel.addMember(groupId, userId, 'admin');

        // Add other members if provided
        if (members && Array.isArray(members)) {
            for (const memberId of members) {
                if (memberId !== userId) {
                    await GroupModel.addMember(groupId, memberId, 'member');
                }
            }
        }

        res.status(201).json({ status: 'success', groupId, message: 'Group created successfully' });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getMyGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const groups = await GroupModel.getGroupsByUser(userId);
        res.status(200).json({ status: 'success', groups });
    } catch (error) {
        console.error('Get my groups error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getGroupMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupId = parseInt(req.params.groupId);
        if (isNaN(groupId)) {
            res.status(400).json({ status: 'error', message: 'Invalid group ID' });
            return;
        }
        const members = await GroupModel.getGroupMembers(groupId);
        res.status(200).json({ status: 'success', members });
    } catch (error) {
        console.error('Get group members error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const addMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { members } = req.body;

        if (isNaN(groupId) || !members || !Array.isArray(members)) {
            res.status(400).json({ status: 'error', message: 'Invalid data' });
            return;
        }

        for (const memberId of members) {
            await GroupModel.addMember(groupId, memberId, 'member');
        }

        res.status(200).json({ status: 'success', message: 'Members added successfully' });
    } catch (error) {
        console.error('Add members error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
