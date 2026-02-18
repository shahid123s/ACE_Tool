import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IRefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository.js';
import { TokenService } from '../../infrastructure/auth/TokenService.js';
import { RefreshToken } from '../../domain/auth/RefreshToken.js';
import { ValidationError, AppError } from '../../domain/errors/index.js';
import { IUseCase } from '../interfaces.js';
import crypto from 'crypto';

export interface RefreshTokenRequest {
    refreshToken: string;
    ip?: string;
    userAgent?: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

export class RefreshUserToken implements IUseCase<RefreshTokenRequest, RefreshTokenResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly refreshTokenRepository: IRefreshTokenRepository
    ) { }

    async execute({ refreshToken, ip, userAgent }: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        if (!refreshToken) {
            throw new ValidationError('Refresh Token is required', 'refreshToken');
        }

        const tokenHash = TokenService.hashToken(refreshToken);
        const existingToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

        if (!existingToken) {
            // Token might be faked or already rotated and deleted?
            // If legitimate user is using an old token that was rotated, we might not find it 
            // if we delete old tokens immediately. But we keep them marked as replaced/revoked usually.
            // If we simply deleted it, we can't do detection.
            // Assuming we don't delete immediately.
            throw new AppError('Invalid Refresh Token', 401);
        }

        // Reuse Detection
        if (existingToken.isRevoked() || existingToken.replacedBy) {
            // Security Alert: Token Reuse Detected!
            // Revoke the entire family
            await this.refreshTokenRepository.revokeFamily(existingToken.familyId);
            throw new AppError('Refresh Token Reuse Detected - Session Revoked', 403);
        }

        if (existingToken.isExpired()) {
            throw new AppError('Refresh Token Expired', 401);
        }

        const user = await this.userRepository.findById(existingToken.userId);
        if (!user) {
            throw new AppError('User not found', 401);
        }

        // Rotate Token

        // 1. Revoke current token
        const newRawRefreshToken = TokenService.generateRefreshToken();
        const newTokenHash = TokenService.hashToken(newRawRefreshToken);

        // We need the ID of the new token to link it?
        // Actually, we create the new token entity first, or update the old one?
        // We need to mark the old one as replaced by the new one. 
        // But we don't have the new one's ID yet if we let DB generate it.
        // Strategy: 
        // Create new token first.

        const newRefreshTokenEntity = new RefreshToken({
            id: '',
            userId: user.id,
            tokenHash: newTokenHash,
            familyId: existingToken.familyId, // Same family
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ip: ip,
            userAgent: userAgent
        });

        const savedNewToken = await this.refreshTokenRepository.save(newRefreshTokenEntity);

        // 2. Mark old token as revoked/replaced
        existingToken.revoke(savedNewToken.id);
        await this.refreshTokenRepository.save(existingToken);

        // Generate Access Token
        const accessToken = TokenService.generateAccessToken(user.toObject());

        return {
            accessToken,
            refreshToken: newRawRefreshToken
        };
    }
}
