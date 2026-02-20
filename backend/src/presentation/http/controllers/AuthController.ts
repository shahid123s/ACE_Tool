import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginRequest, LoginResponse } from '../../../application/auth/LoginUser.js';
import { RefreshTokenRequest, RefreshTokenResponse } from '../../../application/auth/RefreshUserToken.js';
import { LogoutRequest } from '../../../application/auth/LogoutUser.js';
import { UserDTO } from '../../../domain/user/User.js';
import { IUseCase } from '../../../application/interfaces.js';
import { SendOTPRequest, SendOTPResponse } from '../../../application/auth/SendOTP.js';
import { ResetPasswordRequest, ResetPasswordResponse } from '../../../application/auth/ResetPassword.js';

export class AuthController {
    constructor(
        private readonly loginUseCase: IUseCase<LoginRequest, LoginResponse>,
        private readonly refreshUseCase: IUseCase<RefreshTokenRequest, RefreshTokenResponse>,
        private readonly logoutUseCase: IUseCase<LogoutRequest, void>,
        private readonly getUserUseCase: IUseCase<string, UserDTO>,
        private readonly sendOTPUseCase: IUseCase<SendOTPRequest, SendOTPResponse>,
        private readonly resetPasswordUseCase: IUseCase<ResetPasswordRequest, ResetPasswordResponse>
    ) { }

    async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            // Extract IP and User Agent
            const ip = request.ip;
            const userAgent = request.headers['user-agent'] || 'unknown';

            const result = await this.loginUseCase.execute({ ...request.body, ip, userAgent });

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

            const result = await this.refreshUseCase.execute({ refreshToken, ip, userAgent });

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
                await this.logoutUseCase.execute({ refreshToken });
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
        try {
            const userId = request.user?.id;
            if (!userId) {
                return reply.status(401).send({ success: false, message: 'Unauthorized' });
            }

            const user = await this.getUserUseCase.execute(userId);

            return reply.send({
                success: true,
                data: user
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(error.statusCode || 500).send({
                success: false,
                message: error.message
            });
        }
    }
    async forgotPassword(request: FastifyRequest<{ Body: SendOTPRequest }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const result = await this.sendOTPUseCase.execute(request.body);
            return reply.send({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(error.statusCode || 400).send({
                success: false,
                message: error.message
            });
        }
    }

    async resetPassword(request: FastifyRequest<{ Body: ResetPasswordRequest }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const result = await this.resetPasswordUseCase.execute(request.body);
            return reply.send({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(error.statusCode || 400).send({
                success: false,
                message: error.message
            });
        }
    }
}