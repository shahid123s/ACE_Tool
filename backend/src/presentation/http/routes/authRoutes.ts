import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { LoginRequest } from '../../../application/auth/LoginUser.js';

const authController = new AuthController();

/**
 * Authentication routes
 */
const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Authentication routes
    fastify.post('/login', (req: FastifyRequest<{ Body: LoginRequest }>, reply) => authController.login(req, reply));
    fastify.post('/register', (req, reply) => authController.register(req, reply));
    fastify.get('/me', (req, reply) => authController.getMe(req, reply))
};

export default authRoutes;