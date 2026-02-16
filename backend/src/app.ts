import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import config from './config/env.js';
import logger from './infrastructure/logger/index.js';
import userRoutes from './presentation/http/routes/userRoutes.js';
import authRoutes from './presentation/http/routes/authRoutes.js';

/**
 * Create and configure Fastify app
 */
export async function buildApp(): Promise<FastifyInstance> {
    const fastify = Fastify({
        logger: {
            level: 'info'
        }
    });

    // Register CORS
    await fastify.register(cors, {
        origin: true, // In production, specify allowed origins
    });

    // Authentication routes 
    await fastify.register(authRoutes, { prefix: '/api/auth' });

    // Register routes
    await fastify.register(userRoutes, { prefix: '/api/users' });

    return fastify;
}
