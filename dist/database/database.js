"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
// const server = '104.243.43.213'
const server = '127.0.0.1';
const dbConfig = {
    host: server,
    port: 3306,
    user: 'root',
    password: 'Mormon2012@',
    database: 'web_chat_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
const pool = promise_1.default.createPool(dbConfig);
pool.getConnection()
    .then(connection => {
    console.log('✅ Database connected successfully to web_chat_db');
    connection.release();
})
    .catch(error => {
    console.error('❌ Database connection failed:', error);
});
exports.default = pool;
