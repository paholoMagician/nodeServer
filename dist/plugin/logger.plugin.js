"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLogger = buildLogger;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, json } = winston_1.default.format;
// 2. Configuración base del logger
const logger = winston_1.default.createLogger({
    level: 'info',
    format: combine(timestamp(), json()),
    transports: [
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' })
    ]
});
// 3. Función de construcción con tipos
function buildLogger(service) {
    return {
        log: (message, meta) => {
            logger.log('info', Object.assign({ message, service }, meta));
        },
        error: (message, meta) => {
            logger.log('error', Object.assign({ message, service }, meta));
        },
        warn: (message, meta) => {
            logger.log('warn', Object.assign({ message, service }, meta));
        }
    };
}
// 4. Exporta logger por defecto para usar directamente
exports.default = logger;
