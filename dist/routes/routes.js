"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Definimos el endpoint de test
router.get('/test', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'El servidor está activo y funcionando',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
