import mysql from 'mysql2/promise';

const dbConfig = {
    host: '104.243.43.213',
    port: 6566,
    user: 'root',
    password: 'Mormon2012@',
    database: 'marketpydb',
    waitForConnections: true,
    connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

export default pool;