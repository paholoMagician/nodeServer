"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testApi = void 0;
const testApi = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'El servidor está activo y funcionando',
        timestamp: new Date().toISOString()
    });
};
exports.testApi = testApi;
