import { Router } from 'express';
import { createGroup, getMyGroups, getGroupMembers, addMembers, getGroupDetails, updateGroup, uploadGroupImage } from '../controllers/group.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Multer Config for Group Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'wwwroot/storage/groups';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed') as any, false);
        }
    }
});

router.post('/', authenticateToken, createGroup);
router.get('/my', authenticateToken, getMyGroups);
router.get('/:groupId', authenticateToken, getGroupDetails);
router.put('/:groupId', authenticateToken, updateGroup);
router.get('/:groupId/members', authenticateToken, getGroupMembers);
router.post('/:groupId/members', authenticateToken, addMembers);
router.post('/upload', authenticateToken, upload.single('image'), uploadGroupImage);

export default router;
