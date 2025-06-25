import { Router } from 'express';

const router = Router();

router.get('/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'El servidor está activo y funcionando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

export default router;