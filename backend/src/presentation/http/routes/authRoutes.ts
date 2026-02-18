import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { LoginRequest } from '../../../application/auth/LoginUser.js';

const authController = new AuthController();

/**
 * Authentication routes
 */
const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Login Route
    fastify.post<{ Body: LoginRequest }>('/login', authController.login.bind(authController));

    // Refresh Token Route
    fastify.post('/refresh', authController.refresh.bind(authController));

    // Logout Route
    fastify.post('/logout', authController.logout.bind(authController));

    // Register Route (Placeholder)
    fastify.post('/register', authController.register.bind(authController));

    // Get Me Route (Placeholder)
    fastify.get('/me', authController.getMe.bind(authController));
};

export default authRoutes;