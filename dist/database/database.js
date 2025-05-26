"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dbConfig = {
    host: '104.243.43.213',
    port: 6566,
    user: 'root',
    password: 'Mormon2012@',
    database: 'marketpydb',
    waitForConnections: true,
    connectionLimit: 10
};
const pool = promise_1.default.createPool(dbConfig);
exports.default = pool;
