import { FastifyReply, FastifyRequest } from 'fastify';
import { TokenService } from '../../../infrastructure/auth/TokenService.js';

// Extend FastifyRequest to include user
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            role: string;
        };
    }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({ success: false, message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            return reply.status(401).send({ success: false, message: 'Invalid token format' });
        }

        const decoded = TokenService.verifyAccessToken(token);

        request.user = {
            id: decoded.sub || decoded.id, // Support standard 'sub' or custom 'id'
            email: decoded.email,
            role: decoded.role
        };

    } catch (error) {
        return reply.status(401).send({ success: false, message: 'Invalid or expired token' });
    }
};
