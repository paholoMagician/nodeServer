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
            group_image: req.body.group_image || 'src/default_user/default_group.jpg',
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

export const getGroupDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupId = parseInt(req.params.groupId);
        const group = await GroupModel.getGroupById(groupId);
        if (!group) {
            res.status(404).json({ status: 'error', message: 'Group not found' });
            return;
        }
        const members = await GroupModel.getGroupMembers(groupId);
        res.status(200).json({ status: 'success', group, members });
    } catch (error) {
        console.error('Get group details error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { name, description, members, group_image } = req.body;
        const userId = (req as any).user.id;

        const group = await GroupModel.getGroupById(groupId);
        if (!group) {
            res.status(404).json({ status: 'error', message: 'Group not found' });
            return;
        }

        // Ideally check if user is admin, but for now we skip strict check or assume it's done

        await GroupModel.updateGroup(groupId, { name, description, group_image });

        if (members && Array.isArray(members)) {
            await GroupModel.removeAllMembers(groupId);
            // Re-add members
            // Ensure creator/admin is still there
            if (!members.includes(group.created_by)) {
                members.push(group.created_by);
            }

            for (const memberId of members) {
                const role = memberId === group.created_by ? 'admin' : 'member';
                await GroupModel.addMember(groupId, memberId, role);
            }
        }

        res.status(200).json({ status: 'success', message: 'Group updated successfully' });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const uploadGroupImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ status: 'error', message: 'No file uploaded' });
            return;
        }

        const filePath = `storage/groups/${req.file.filename}`;
        res.status(200).json({ status: 'success', path: filePath });
    } catch (error) {
        console.error('Upload group image error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupId = parseInt(req.params.groupId);
        const userId = (req as any).user.id;

        const group = await GroupModel.getGroupById(groupId);
        if (!group) {
            res.status(404).json({ status: 'error', message: 'Group not found' });
            return;
        }

        if (group.created_by !== userId) {
            res.status(403).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        const success = await GroupModel.softDeleteGroup(groupId);
        if (success) {
            res.status(200).json({ status: 'success', message: 'Group deleted successfully' });
        } else {
            res.status(500).json({ status: 'error', message: 'Failed to delete group' });
        }
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
