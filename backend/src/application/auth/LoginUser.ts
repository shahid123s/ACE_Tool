import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { UserDTO } from '../../domain/user/User.js';
import { ValidationError } from '../../domain/errors/index.js';
import { IUseCase } from '../interfaces.js';
import { IRefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository.js';
import { TokenService } from '../../infrastructure/auth/TokenService.js';
import { RefreshToken } from '../../domain/auth/RefreshToken.js';
// import config from '../../config/env.js';

export interface LoginRequest {
    email: string;
    password?: string;
    ip?: string;
    userAgent?: string;
}

export interface LoginResponse {
    user: UserDTO;
    accessToken: string;
    refreshToken: string; // To be set in cookie
}

export class LoginUser implements IUseCase<LoginRequest, LoginResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly refreshTokenRepository: IRefreshTokenRepository
    ) { }

    async execute({ email, password, ip, userAgent }: LoginRequest): Promise<LoginResponse> {
        if (!email || !password) {
            throw new ValidationError('Email and password are required', 'email');
        }

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new ValidationError('Invalid credentials', 'auth');
        }

        if (!user.password) {
            throw new ValidationError('Invalid credentials', 'auth');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Dev backdoor
            if (process.env.NODE_ENV === 'development' && password === 'password' && user.email === 'admin@ace.com') {
                // Pass
            } else {
                throw new ValidationError('Invalid credentials', 'auth');
            }
        }

        // Generate Access Token
        const accessToken = TokenService.generateAccessToken(user.toObject());

        // Generate Refresh Token
        const rawRefreshToken = TokenService.generateRefreshToken();
        const tokenHash = TokenService.hashToken(rawRefreshToken);
        const familyId = crypto.randomUUID();

        const refreshTokenEntity = new RefreshToken({
            id: '', // New entity
            userId: user.id,
            tokenHash: tokenHash,
            familyId: familyId,
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days hardcoded or from env
            ip: ip,
            userAgent: userAgent
        });

        await this.refreshTokenRepository.save(refreshTokenEntity);

        return {
            user: user.toObject(),
            accessToken,
            refreshToken: rawRefreshToken
        };
    }
}
