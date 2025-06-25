import { Request, Response } from 'express';

export const testApi = (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'El servidor está activo y funcionando',
        timestamp: new Date().toISOString()
    });
};