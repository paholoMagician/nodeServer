import mysql from 'mysql2/promise';

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

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully to web_chat_db');
        connection.release();
    })
    .catch(error => {
        console.error('❌ Database connection failed:', error);
    });

export default pool;