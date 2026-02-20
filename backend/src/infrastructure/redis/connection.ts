import { Redis, type RedisOptions } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const baseOptions: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times: number) {
        return Math.min(times * 50, 2000);
    },
};

let redisClient: Redis;

if (process.env.REDIS_HOST) {
    // Cloud Redis — separate credentials (Host, Port, Password)
    const options: RedisOptions = {
        ...baseOptions,
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD,
        // tls: {}, // Cloud Redis requires TLS
    };
    console.log(`Connecting to Cloud Redis at: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
    redisClient = new Redis(options);
} else {
    // Local Redis — connection URL
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    console.log(`Connecting to Local Redis at: ${url}`);
    redisClient = new Redis(url, baseOptions);
}

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err: Error) => {
    console.error('❌ Redis connection error:', err.message);
});

export const redis = redisClient;
