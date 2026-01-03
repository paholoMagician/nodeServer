import { Router } from 'express';

const router = Router();

// Definimos el endpoint de test
router.get('/test', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'RetroChat Backend is ONLINE',
        ip: '152.53.89.82',
        port: 6567,
        endpoints: {
            auth: '/api/auth',
            chat: '/api/chat',
            test: '/api/test'
        },
        timestamp: new Date().toISOString()
    });
});

export default router;