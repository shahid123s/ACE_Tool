import { RefreshToken } from './RefreshToken.js';

export interface IRefreshTokenRepository {
    save(refreshToken: RefreshToken): Promise<RefreshToken>;
    findById(id: string): Promise<RefreshToken | null>;
    findByTokenHash(tokenHash: string): Promise<RefreshToken | null>; // To find by the token provided by user
    delete(id: string): Promise<boolean>;
    revokeFamily(familyId: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<void>;
}
