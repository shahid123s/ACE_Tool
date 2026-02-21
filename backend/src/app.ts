import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import config from './config/env.js';
import logger from './infrastructure/logger/index.js';
import userRoutes from './presentation/http/routes/userRoutes.js';
import authRoutes from './presentation/http/routes/authRoutes.js';
import adminRoutes from './presentation/http/routes/adminRoutes.js';
import worklogRoutes from './presentation/http/routes/worklogRoutes.js';

/**
 * Create and configure Fastify app
 */
export async function buildApp(): Promise<FastifyInstance> {
    const fastify = Fastify({
        logger: {
            level: 'info'
        }
    });

    // Register Plugins
    await fastify.register(cors, {
        origin: true, // Allow all origins for dev, restrict in prod
        credentials: true, // Important for cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    });

    await fastify.register(cookie, {
        secret: process.env.COOKIE_SECRET || 'secret-cookie-key', // for signed cookies
        hook: 'onRequest',
        parseOptions: {}
    });

    // Authentication routes 
    await fastify.register(authRoutes, { prefix: '/api/auth' });

    // Register routes
    await fastify.register(userRoutes, { prefix: '/api/users' });

    // Admin routes (auth + admin guard inside)
    await fastify.register(adminRoutes, { prefix: '/api/admin' });

    // Worklog routes (user — auth inside route plugin)
    await fastify.register(worklogRoutes, { prefix: '/api/worklogs' });

    return fastify;
}
