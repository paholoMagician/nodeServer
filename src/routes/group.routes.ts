import { Router } from 'express';
import { createGroup, getMyGroups, getGroupMembers, addMembers } from '../controllers/group.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, createGroup);
router.get('/my', authenticateToken, getMyGroups);
router.get('/:groupId/members', authenticateToken, getGroupMembers);
router.post('/:groupId/members', authenticateToken, addMembers);

export default router;
