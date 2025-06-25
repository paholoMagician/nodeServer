import { Router } from 'express';

const router = Router();

// Definimos el endpoint de test
router.get('/test', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'El servidor está activo y funcionando',
        timestamp: new Date().toISOString()
    });
});

export default router;