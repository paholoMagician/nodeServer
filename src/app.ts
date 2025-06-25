import 'dotenv/config';
import express from 'express';
import testRoutes from './routes/routes';

// Configuración desde .env con valores por defecto
const PORT = process.env.SERVER_PORT || 6565;
const HOST = process.env.SERVER_HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Usar rutas
app.use(process.env.API_PREFIX || '/api', testRoutes);

// Iniciar servidor
app.listen(Number(PORT), HOST, () => {
    console.log(`🟢 Servidor [${NODE_ENV}] activo en http://${HOST}:${PORT}`);
    console.log(`🔍 Prueba el endpoint en http://${HOST}:${PORT}${process.env.API_PREFIX || '/api'}/test`);
});