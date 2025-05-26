import pool from '../database/database';
import { RowDataPacket } from 'mysql2';
interface User {
    idusers?: number;
    nombre: string;
    email: string;
    password: string;
    perfilImagen?: string | null;
    estado: number;
    rol: string;
}

export default {

    // Añade este método para buscar por email
    async getByEmail(email: string): Promise<User[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows as User[];
    },

    // CREATE
    async createUser(user: User) {

        console.table(user)

        const [result] = await pool.execute(
            'INSERT INTO users (nombre, email, password, estado, rol) VALUES (?, ?, ?, ?, ?)',
            [user.nombre, user.email, user.password, user.estado, user.rol]
        );
        return result;
    },

    // READ (all)
    async getAllUsers() {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
    },

    // READ (by id)
    async getUserById(id: number) {
        const [rows] = await pool.query('SELECT * FROM users WHERE idusers = ?', [id]);
        return rows;
    },

    // UPDATE
    async updateUser(id: number, user: Partial<User>) {
        const [result] = await pool.query(
            'UPDATE users SET nombre = ?, email = ?, estado = ?, rol = ? WHERE idusers = ?',
            [user.nombre, user.email, user.estado, user.rol, id]
        );
        return result;
    },

    // DELETE (soft delete)
    async deleteUser(id: number) {
        const [result] = await pool.query(
            'UPDATE users SET estado = 0 WHERE idusers = ?',
            [id]
        );
        return result;
    },

    // Validar credenciales
    async validateCredentials(email: string, password: string) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND password = ? AND estado = 1',
            [email, password]
        );
        return rows;
    }


};