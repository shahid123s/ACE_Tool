import { redis } from './connection.js';
import { IOtpRepository } from '../../domain/auth/IOtpRepository.js';

export class RedisOtpRepository implements IOtpRepository {
    private readonly prefix = 'otp:email:';

    async save(email: string, otp: string, ttlSeconds: number): Promise<void> {
        const key = this.getKey(email);
        await redis.set(key, otp, 'EX', ttlSeconds);
    }

    async get(email: string): Promise<string | null> {
        const key = this.getKey(email);
        return await redis.get(key);
    }

    async delete(email: string): Promise<void> {
        const key = this.getKey(email);
        await redis.del(key);
    }

    private getKey(email: string): string {
        return `${this.prefix}${email}`;
    }
}

export const otpRepository = new RedisOtpRepository();
