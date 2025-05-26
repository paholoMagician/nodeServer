"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_plugin_1 = require("../plugin/logger.plugin"); // Importas tu logger
const logger = (0, logger_plugin_1.buildLogger)('auth-service'); // Inicializas para este servicio
// 1. Carga de configuración
dotenv_1.default.config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
// 3. Validación de variables de entorno
const validateEnv = () => {
    const requiredVars = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME'
    ];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        logger.log(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
        throw new Error(`Configuración incompleta: ${missingVars.join(', ')}`);
    }
    // Validación adicional para JWT en desarrollo
    if (process.env.NODE_ENV === 'development') {
        if (process.env.JWT_SECRET.length < 32) {
            logger.log('Advertencia: JWT_SECRET es demasiado corto (mínimo recomendado: 32 caracteres)');
        }
    }
};
// 4. Configuración principal
exports.AuthConfig = {
    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN || '900'), // 15 min por defecto
        REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        REFRESH_EXPIRES_IN: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800'), // 7 días por defecto
        COOKIE_NAME: process.env.JWT_COOKIE_NAME || 'atlas_refresh_token'
    },
    DB: {
        HOST: process.env.DB_HOST,
        PORT: parseInt(process.env.DB_PORT || '3306'),
        USER: process.env.DB_USER,
        PASSWORD: maskPassword(process.env.DB_PASSWORD), // Enmascaramos en logs
        NAME: process.env.DB_NAME,
        SSL: process.env.DB_SSL === 'true'
    }
};
// 5. Función para enmascarar datos sensibles en logs
function maskPassword(password) {
    return `${password.substring(0, 2)}****${password.substring(password.length - 2)}`;
}
// 6. Inicialización y registro
try {
    validateEnv();
    logger.log('Configuración de autenticación cargada correctamente');
    logger.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV === 'development') {
        logger.log(`Config JWT: ${JSON.stringify(Object.assign(Object.assign({}, exports.AuthConfig.JWT), { SECRET: '****', REFRESH_SECRET: '****' }))}`);
    }
}
catch (error) {
    logger.log(`Error en configuración: ${error}`);
    process.exit(1);
}
