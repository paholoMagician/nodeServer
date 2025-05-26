import { IncomingMessage, ServerResponse } from 'http';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthConfig } from '../config/auth';
import userModel from '../models/userModel';
import { buildLogger } from '../plugin/logger.plugin';

const logger = buildLogger('user-controller');

interface UserRequest extends IncomingMessage {
    body?: any;
    parsedUrl?: URL;
}

interface User {
    idusers?: number;
    nombre: string;
    email: string;
    password: string;
    perfilImagen?: string | null;
    estado?: number;
    rol?: string;
}

export default {
    // CREATE USER
    async create(req: UserRequest, res: ServerResponse) {
        try {
            const body = await this.parseRequestBody(req);
            const userData = this.validateUserData(body);

            // Hash password antes de guardar
            const salt = await bcrypt.genSalt(10);
            // const hashedPassword = await bcrypt.hash(userData.password, salt);

            const newUser: any = {
                nombre: userData.nombre,
                email: userData.email,
                password: userData.password,
                estado: 1, // Activo por defecto
                rol: userData.rol || 'USR' // Rol por defecto
            };

            const result = await userModel.createUser(newUser);
            this.sendResponse(res, 201, {
                success: true,
                data: result
            });

        } catch (error) {
            logger.error(`Error creating user: ${error}`);
            this.handleError(res, error);
        }
    },

    // LOGIN
    async login(req: UserRequest, res: ServerResponse) {
        try {
            const body = await this.parseRequestBody(req);
            const { email, password } = body;

            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos');
            }

            logger.log(`Login attempt for: ${email}`);

            // Buscar usuario
            const users = await userModel.getByEmail(email);
            const user = users[0];

            if (!user) throw new Error('Credenciales inválidas');
            if ( password != user.password ) throw new Error('Contraseña incorrecta');
            
            // Verificar contraseña
            // const isMatch = await bcrypt.compare(password, user.password);
            // if (!isMatch) throw new Error('Credenciales inválidas');

            // Generar tokens
            const token = jwt.sign(
                { userId: user.idusers, email: user.email, rol: user.rol },
                AuthConfig.JWT.SECRET,
                { expiresIn: AuthConfig.JWT.EXPIRES_IN }
            );

            const refreshToken = jwt.sign(
                { userId: user.idusers },
                AuthConfig.JWT.REFRESH_SECRET,
                { expiresIn: AuthConfig.JWT.REFRESH_EXPIRES_IN }
            );

            // Excluir password en la respuesta
            const { password: _, ...userData } = user;

            this.sendResponse(res, 200, {
                success: true,
                data: {
                    user: userData,
                    token,
                    refreshToken,
                    expiresIn: AuthConfig.JWT.EXPIRES_IN
                }
            });

        } catch (error) {
            logger.error(`Login failed: ${error}`);
            this.handleError(res, error, 401);
        }
    },

    // GET ALL USERS
    async getAll(req: UserRequest, res: ServerResponse) {
        try {
            const users = await userModel.getAllUsers();
            this.sendResponse(res, 200, {
                success: true,
                data: users
            });
        } catch (error) {
            logger.error(`Error getting users: ${error}`);
            this.handleError(res, error);
        }
    },

    // GET USER BY ID
    async getById(req: UserRequest, res: ServerResponse) {
        try {
            const id = this.extractIdFromRequest(req);
            if (!id) throw new Error('ID de usuario no proporcionado');

            const user = await userModel.getUserById(id);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            this.sendResponse(res, 200, {
                success: true,
                data: user
            });
        } catch (error) {
            logger.error(`Error getting user: ${error}`);
            this.handleError(res, error);
        }
    },

    // UPDATE USER
    async update(req: UserRequest, res: ServerResponse) {
        try {
            const id = this.extractIdFromRequest(req);
            if (!id) throw new Error('ID de usuario no proporcionado');

            const body = await this.parseRequestBody(req);
            const updatedUser = this.validateUserData(body, false); // No requerir password para update

            const result = await userModel.updateUser(id, updatedUser);
            this.sendResponse(res, 200, {
                success: true,
                data: result
            });
        } catch (error) {
            logger.error(`Error updating user: ${error}`);
            this.handleError(res, error);
        }
    },

    // DELETE USER (soft delete)
    async delete(req: UserRequest, res: ServerResponse) {
        try {
            const id = this.extractIdFromRequest(req);
            if (!id) throw new Error('ID de usuario no proporcionado');

            const result = await userModel.deleteUser(id);
            this.sendResponse(res, 200, {
                success: true,
                data: result
            });
        } catch (error) {
            logger.error(`Error deleting user: ${error}`);
            this.handleError(res, error);
        }
    },

    // UTILITY METHODS
    async parseRequestBody(req: IncomingMessage): Promise<any> {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (e) {
                    reject(new Error('Formato JSON inválido'));
                }
            });
            req.on('error', reject);
        });
    },

    validateUserData(data: any, requirePassword = true): User {
        if (!data.nombre || !data.email || (requirePassword && !data.password)) {
            throw new Error('Datos de usuario incompletos');
        }
        return data;
    },

    extractIdFromRequest(req: UserRequest): number | null {
        const id = req.parsedUrl?.pathname?.split('/').pop();
        return id ? parseInt(id) : null;
    },

    sendResponse(res: ServerResponse, statusCode: number, data: object) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    },

    handleError(res: ServerResponse, error: unknown, statusCode = 500) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        logger.error(`Error: ${errorMessage}`);
        this.sendResponse(res, statusCode, {
            success: false,
            error: errorMessage
        });
    }
};