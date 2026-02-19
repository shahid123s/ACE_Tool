import { IRefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository.js';
import { TokenService } from '../../infrastructure/auth/TokenService.js';
import { IUseCase } from '../interfaces.js';

export interface LogoutRequest {
    refreshToken: string;
}

export class LogoutUser implements IUseCase<LogoutRequest, void> {
    constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) { }

    async execute({ refreshToken }: LogoutRequest): Promise<void> {
        if (!refreshToken) return;

        const tokenHash = TokenService.hashToken(refreshToken);
        const token = await this.refreshTokenRepository.findByTokenHash(tokenHash);

        if (token) {
            token.revoke();
            await this.refreshTokenRepository.save(token);
        }
    }
}
