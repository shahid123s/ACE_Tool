import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { LoginUser, LoginRequest } from '../../../application/auth/LoginUser.js';
import { RefreshUserToken } from '../../../application/auth/RefreshUserToken.js';
import { LogoutUser } from '../../../application/auth/LogoutUser.js';
import { GetUser } from '../../../application/user/GetUser.js';
import { userRepository } from '../../../infrastructure/database/MongoUserRepository.js';
// import { refreshTokenRepository } from '../../../infrastructure/database/MongoRefreshTokenRepository.js'; // Deprecated
import { refreshTokenRepository } from '../../../infrastructure/redis/RedisRefreshTokenRepository.js';
import { otpRepository } from '../../../infrastructure/redis/RedisOtpRepository.js';
import { authenticate } from '../middleware/authenticate.js';
import { SendOTP, SendOTPRequest } from '../../../application/auth/SendOTP.js';
import { ResetPassword, ResetPasswordRequest } from '../../../application/auth/ResetPassword.js';
import { emailService } from '../../../infrastructure/email/NodemailerEmailService.js';

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
    const sendOTP = new SendOTP(userRepository, otpRepository, emailService);
    const resetPassword = new ResetPassword(userRepository, otpRepository);

    // 2. Instantiate Controller (Presentation Layer)
    // Inject Use Cases
    const authController = new AuthController(
        loginUser,
        refreshUserToken,
        logoutUser,
        getUser,
        sendOTP,
        resetPassword
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

    // Forgot Password Route
    fastify.post<{ Body: SendOTPRequest }>('/forgot-password', authController.forgotPassword.bind(authController));

    // Reset Password Route
    fastify.post<{ Body: ResetPasswordRequest }>('/reset-password', authController.resetPassword.bind(authController));
};

export default authRoutes;









