import { redis } from './connection.js';
import { IRefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository.js';
import { RefreshToken } from '../../domain/auth/RefreshToken.js';

export class RedisRefreshTokenRepository implements IRefreshTokenRepository {
    private readonly prefix = 'refresh_token:';
    private readonly hashPrefix = 'refresh_token:hash:';
    private readonly familyPrefix = 'refresh_token:family:';
    private readonly userPrefix = 'refresh_token:user:';

    async save(refreshToken: RefreshToken): Promise<RefreshToken> {
        const data = {
            id: refreshToken.id,
            userId: refreshToken.userId,
            tokenHash: refreshToken.tokenHash,
            familyId: refreshToken.familyId,
            issuedAt: refreshToken.issuedAt.toISOString(),
            expiresAt: refreshToken.expiresAt.toISOString(),
            revokedAt: refreshToken.revokedAt ? refreshToken.revokedAt.toISOString() : null,
            replacedBy: refreshToken.replacedBy || null,
            ip: refreshToken.ip || null,
            userAgent: refreshToken.userAgent || null
        };

        const key = this.getKey(refreshToken.id);
        const ttl = Math.max(0, Math.ceil((refreshToken.expiresAt.getTime() - Date.now()) / 1000));

        if (ttl <= 0) {
            // Token already expired, don't save? or save for a moment?
            // If expired, we might not need to save it unless we want to keep history.
            // For now, save with short TTL if expired, or just let it be.
            // Let's safe with 1 second if expired to avoid errors.
        }

        const pipeline = redis.pipeline();

        // Save main record
        pipeline.set(key, JSON.stringify(data), 'EX', ttl > 0 ? ttl : 1);

        // Update indexes
        pipeline.set(this.getHashKey(refreshToken.tokenHash), refreshToken.id, 'EX', ttl > 0 ? ttl : 1);
        pipeline.sadd(this.getFamilyKey(refreshToken.familyId), refreshToken.id);
        pipeline.sadd(this.getUserKey(refreshToken.userId), refreshToken.id);

        // Expiration for sets is tricky. We'll rely on app logic to clean up or basic TTL on sets (not ideal).
        // A better approach for sets is to pull them, check validity, and remove invalid.
        // For this implementation, we will accept that sets might grow with expired IDs, 
        // effectively handled by checking existence of Key.
        // We can add a periodic cleanup or check on read.
        // For simplicity: We add to set. When we read from set, if key is gone, we remove from set.

        await pipeline.exec();

        return refreshToken;
    }

    async findById(id: string): Promise<RefreshToken | null> {
        const key = this.getKey(id);
        const dataStr = await redis.get(key);
        if (!dataStr) return null;

        return this.mapToDomain(JSON.parse(dataStr));
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const id = await redis.get(this.getHashKey(tokenHash));
        if (!id) return null;
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const refreshToken = await this.findById(id);
        if (!refreshToken) return false;

        const pipeline = redis.pipeline();
        pipeline.del(this.getKey(id));
        pipeline.del(this.getHashKey(refreshToken.tokenHash));
        pipeline.srem(this.getFamilyKey(refreshToken.familyId), id);
        pipeline.srem(this.getUserKey(refreshToken.userId), id);

        await pipeline.exec();
        return true;
    }

    async revokeFamily(familyId: string): Promise<void> {
        const key = this.getFamilyKey(familyId);
        const ids = await redis.smembers(key);

        for (const id of ids) {
            const token = await this.findById(id);
            if (token) {
                token.revoke();
                await this.save(token);
            } else {
                // Cleanup stale index
                await redis.srem(key, id);
            }
        }
    }

    async revokeAllForUser(userId: string): Promise<void> {
        const key = this.getUserKey(userId);
        const ids = await redis.smembers(key);

        for (const id of ids) {
            const token = await this.findById(id);
            if (token && !token.isRevoked()) {
                token.revoke();
                await this.save(token);
            } else if (!token) {
                await redis.srem(key, id);
            }
        }
    }

    private mapToDomain(data: any): RefreshToken {
        return new RefreshToken({
            id: data.id,
            userId: data.userId,
            tokenHash: data.tokenHash,
            familyId: data.familyId,
            issuedAt: new Date(data.issuedAt),
            expiresAt: new Date(data.expiresAt),
            revokedAt: data.revokedAt ? new Date(data.revokedAt) : undefined,
            replacedBy: data.replacedBy || undefined,
            ip: data.ip || undefined,
            userAgent: data.userAgent || undefined
        });
    }

    private getKey(id: string): string {
        return `${this.prefix}${id}`;
    }

    private getHashKey(hash: string): string {
        return `${this.hashPrefix}${hash}`;
    }

    private getFamilyKey(familyId: string): string {
        return `${this.familyPrefix}${familyId}`;
    }

    private getUserKey(userId: string): string {
        return `${this.userPrefix}${userId}`;
    }
}

export const refreshTokenRepository = new RedisRefreshTokenRepository();
