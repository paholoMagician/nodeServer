import express from 'express';
import testRoutes from './routes/routes';

const app = express();
const PORT = 6565;

// Configuramos las rutas bajo el prefijo /api
app.use('/api', testRoutes);

// Iniciamos el servidor
app.listen(PORT, () => {
    console.log(`🚀 Ready server in http://localhost:${PORT}`);
    console.log(`🔍 Endpoint deploy in http://localhost:${PORT}/api/test`);
});