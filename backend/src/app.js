import Fastify from 'fastify';
import cors from '@fastify/cors';
import config from './config/env.js';
import logger from './infrastructure/logger/index.js';
import userRoutes from './presentation/http/routes/userRoutes.js';

/**
 * Create and configure Fastify app
 */
export async function buildApp() {
    const fastify = Fastify({
        logger: {
            level: config.nodeEnv === 'production' ? 'info' : 'debug',
        }
    });

    // Register CORS
    await fastify.register(cors, {
        origin: true, // In production, specify allowed origins
    });

    // Register routes
    await fastify.register(userRoutes, { prefix: '/api' });

    return fastify;
}
