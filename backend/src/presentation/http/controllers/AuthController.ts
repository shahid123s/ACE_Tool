import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginUser, LoginRequest } from '../../../application/auth/LoginUser.js';
import { RefreshUserToken } from '../../../application/auth/RefreshUserToken.js';
import { LogoutUser } from '../../../application/auth/LogoutUser.js';
import { MongoUserRepository, userRepository } from '../../../infrastructure/database/MongoUserRepository.js';
import { MongoRefreshTokenRepository, refreshTokenRepository } from '../../../infrastructure/database/MongoRefreshTokenRepository.js';

export class AuthController {
    private userRepository: MongoUserRepository;
    private refreshTokenRepository: MongoRefreshTokenRepository;

    constructor() {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const loginUser = new LoginUser(this.userRepository, this.refreshTokenRepository);

            // Extract IP and User Agent
            const ip = request.ip;
            const userAgent = request.headers['user-agent'] || 'unknown';

            const result = await loginUser.execute({ ...request.body, ip, userAgent });

            // Set Refresh Token as HttpOnly Cookie
            reply.setCookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // true in prod
                sameSite: 'strict',
                path: '/api/auth', // Restrict to auth routes
                maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
            });

            return reply.send({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken
                }
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(error.statusCode || 401).send({
                success: false,
                message: error.message
            });
        }
    }

    async refresh(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const refreshToken = request.cookies.refreshToken;
            if (!refreshToken) {
                return reply.status(401).send({ success: false, message: 'No refresh token provided' });
            }

            const ip = request.ip;
            const userAgent = request.headers['user-agent'] || 'unknown';

            const refreshUserToken = new RefreshUserToken(this.userRepository, this.refreshTokenRepository);
            const result = await refreshUserToken.execute({ refreshToken, ip, userAgent });

            // Rotate Cookie
            reply.setCookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/auth',
                maxAge: 7 * 24 * 60 * 60
            });

            return reply.send({
                success: true,
                data: {
                    accessToken: result.accessToken
                }
            });

        } catch (error: any) {
            request.log.error(error);
            // Clear cookie on failure (security practice)
            reply.clearCookie('refreshToken', { path: '/api/auth' });

            return reply.status(error.statusCode || 401).send({
                success: false,
                message: error.message || 'Invalid refresh token'
            });
        }
    }

    async logout(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const refreshToken = request.cookies.refreshToken;
            if (refreshToken) {
                const logoutUser = new LogoutUser(this.refreshTokenRepository);
                await logoutUser.execute({ refreshToken });
            }

            reply.clearCookie('refreshToken', { path: '/api/auth' });
            return reply.send({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ success: false, message: 'Logout failed' });
        }
    }

    async register(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        return reply.status(501).send({ message: 'Not implemented' });
    }

    async getMe(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        return reply.status(501).send({ message: 'Not implemented' });
    }
}
