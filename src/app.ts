import { createServer } from 'http';
import url from 'url';
import userController from './controllers/userController';
import pool from './database/database';
import { RowDataPacket } from 'mysql2';

// local
// const PORT = 3001;
// server demo
const PORT = 9998;
// HOME
// const HOST = '192.168.100.6';
// WORK
// const HOST = '192.168.55.64';
// SERVER DEMO
const HOST = '104.243.43.213';

// Verificar conexión a MySQL antes de iniciar el servidor
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida correctamente');
        connection.release();

        const [tables] = await pool.execute<RowDataPacket[]>("SHOW TABLES LIKE 'users'");
        if (tables.length === 0) {
            console.warn('⚠️ La tabla "users" no existe en la base de datos');
        } else {
            console.log('✅ Tabla "users" encontrada');
        }
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error);
        process.exit(1);
    }
}

const server = createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    const path = parsedUrl.pathname;
    const method = req.method;

    console.log(`📦 [${new Date().toISOString()}] ${method} ${path}`);

    // Configurar CORS básico
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejar preflight para CORS
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Routes
    try {
        if (path === '/api/auth/login' && method === 'POST') {
            await userController.login(req, res);
        }
        else if (path === '/api/users' && method === 'POST') {
            await userController.create(req, res);
        }
        else if (path === '/api/users' && method === 'GET') {
            await userController.getAll(req, res);
        }
        else if (path?.startsWith('/api/users/') && method === 'GET') {
            await userController.getById(req, res);
        }
        else if (path?.startsWith('/api/users/') && method === 'PUT') {
            await userController.update(req, res);
        }
        else if (path?.startsWith('/api/users/') && method === 'DELETE') {
            await userController.delete(req, res);
        }
        else {
            userController.sendResponse(res, 404, {
                success: false,
                message: 'Endpoint no encontrado'
            });
        }
    } catch (error) {
        userController.handleError(res, error);
    }
});

// Iniciar servidor
async function startServer() {
    await testDatabaseConnection();

    server.listen(PORT, HOST, () => {
        console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
        console.log('Endpoints disponibles:');
        console.log(`- POST   http://${HOST}:${PORT}/api/auth/login`);
        console.log(`- POST   http://${HOST}:${PORT}/api/users`);
        console.log(`- GET    http://${HOST}:${PORT}/api/users`);
        console.log(`- GET    http://${HOST}:${PORT}/api/users/:id`);
        console.log(`- PUT    http://${HOST}:${PORT}/api/users/:id`);
        console.log(`- DELETE http://${HOST}:${PORT}/api/users/:id`);
    });
}

startServer().catch(err => {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
});

// Manejo de cierre elegante
process.on('SIGINT', () => {
    console.log('\n🔴 Apagando servidor...');
    server.close(() => {
        pool.end().then(() => {
            console.log('✅ Conexiones cerradas correctamente');
            process.exit(0);
        });
    });
});