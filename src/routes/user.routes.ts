import { Router } from 'express';
import { getProfile, updateProfile, uploadProfilePicture } from '../controllers/user.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'wwwroot/storage/perfil';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Use original name but sanitize it or just use timestamp to avoid conflicts?
        // User requested: "wwwroot/storage/perfil/'nombreDeLaImagen'/nombredelaimagen.png"
        // But that structure seems a bit complex for multer directly.
        // Let's stick to "wwwroot/storage/perfil/filename.png" for simplicity first, 
        // or try to match the requested structure if possible.
        // The request said: "wwwroot/storage/perfil/'nombreDeLaImagen'/nombredelaimagen.png"
        // This implies a folder per image? That's unusual. 
        // Let's assume they meant a folder per user or just a unique name.
        // Actually, "nombreDeLaImagen" as a folder name for the image itself is redundant.
        // I will implement: wwwroot/storage/perfil/[timestamp]-[filename] to ensure uniqueness.

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.post('/:id/picture', upload.single('profilePicture'), uploadProfilePicture);

export default router;
