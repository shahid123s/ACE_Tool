import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { LoginUser, LoginRequest } from '../../../application/auth/LoginUser.js';
import { RefreshUserToken } from '../../../application/auth/RefreshUserToken.js';
import { LogoutUser } from '../../../application/auth/LogoutUser.js';
import { GetUser } from '../../../application/user/GetUser.js';
import { userRepository } from '../../../infrastructure/database/MongoUserRepository.js';
import { refreshTokenRepository } from '../../../infrastructure/database/MongoRefreshTokenRepository.js';
import { authenticate } from '../middleware/authenticate.js';

/**
 * Authentication routes
 * Acts as Composition Root for Auth Module
 */
const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // 1. Instantiate Use Cases (Application Layer)
    // Inject Repositories (Infrastructure Layer)
    const loginUser = new LoginUser(userRepository, refreshTokenRepository);
    const refreshUserToken = new RefreshUserToken(userRepository, refreshTokenRepository);
    const logoutUser = new LogoutUser(refreshTokenRepository);
    const getUser = new GetUser(userRepository);

    // 2. Instantiate Controller (Presentation Layer)
    // Inject Use Cases
    const authController = new AuthController(
        loginUser,
        refreshUserToken,
        logoutUser,
        getUser
    );

    // 3. Define Routes
    // Login Route
    fastify.post<{ Body: LoginRequest }>('/login', authController.login.bind(authController));

    // Refresh Token Route
    fastify.post('/refresh', authController.refresh.bind(authController));

    // Logout Route
    fastify.post('/logout', authController.logout.bind(authController));

    // Register Route (Placeholder)
    fastify.post('/register', authController.register.bind(authController));

    // Get Me Route
    fastify.get('/me', { preHandler: [authenticate] }, authController.getMe.bind(authController));
};

export default authRoutes;