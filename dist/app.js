"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const url_1 = __importDefault(require("url"));
const userController_1 = __importDefault(require("./controllers/userController"));
const database_1 = __importDefault(require("./database/database"));
// local lan
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
function testDatabaseConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield database_1.default.getConnection();
            console.log('✅ Conexión a MySQL establecida correctamente');
            connection.release();
            const [tables] = yield database_1.default.execute("SHOW TABLES LIKE 'users'");
            if (tables.length === 0) {
                console.warn('⚠️ La tabla "users" no existe en la base de datos');
            }
            else {
                console.log('✅ Tabla "users" encontrada');
            }
        }
        catch (error) {
            console.error('❌ Error al conectar con MySQL:', error);
            process.exit(1);
        }
    });
}
const server = (0, http_1.createServer)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedUrl = url_1.default.parse(req.url || '', true);
    const path = parsedUrl.pathname;
    const method = req.method;
    console.log(`📦 [${new Date().toISOString()}] ${method} ${path}`);
    // Configurar CORS básico
    res.setHeader('Access-Control-Allow-Origin', '*');
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
            yield userController_1.default.login(req, res);
        }
        else if (path === '/api/users' && method === 'POST') {
            yield userController_1.default.create(req, res);
        }
        else if (path === '/api/users' && method === 'GET') {
            yield userController_1.default.getAll(req, res);
        }
        else if ((path === null || path === void 0 ? void 0 : path.startsWith('/api/users/')) && method === 'GET') {
            yield userController_1.default.getById(req, res);
        }
        else if ((path === null || path === void 0 ? void 0 : path.startsWith('/api/users/')) && method === 'PUT') {
            yield userController_1.default.update(req, res);
        }
        else if ((path === null || path === void 0 ? void 0 : path.startsWith('/api/users/')) && method === 'DELETE') {
            yield userController_1.default.delete(req, res);
        }
        else {
            userController_1.default.sendResponse(res, 404, {
                success: false,
                message: 'Endpoint no encontrado'
            });
        }
    }
    catch (error) {
        userController_1.default.handleError(res, error);
    }
}));
// Iniciar servidor
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testDatabaseConnection();
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
        database_1.default.end().then(() => {
            console.log('✅ Conexiones cerradas correctamente');
            process.exit(0);
        });
    });
});
