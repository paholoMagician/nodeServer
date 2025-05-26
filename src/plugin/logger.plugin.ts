import winston from 'winston';

const { combine, timestamp, json } = winston.format;

// 1. Define la interfaz para tu logger
export interface Logger {
    log: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
}

// 2. Configuración base del logger
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// 3. Función de construcción con tipos
export function buildLogger(service: string): Logger {
    return {
        log: (message: string, meta?: Record<string, unknown>) => {
            logger.log('info', { message, service, ...meta });
        },
        error: (message: string, meta?: Record<string, unknown>) => {
            logger.log('error', { message, service, ...meta });
        },
        warn: (message: string, meta?: Record<string, unknown>) => {
            logger.log('warn', { message, service, ...meta });
        }
    };
}

// 4. Exporta logger por defecto para usar directamente
export default logger;