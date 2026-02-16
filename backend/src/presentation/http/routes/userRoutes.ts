import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { UserController } from '../controllers/UserController.js';
import { CreateUserRequest } from '../../../application/user/CreateUser.js';

const userController = new UserController();

/**
 * User routes
 */
const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Health check
    fastify.get('/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // User routes
    fastify.post('/users', (req: FastifyRequest<{ Body: CreateUserRequest }>, reply) => userController.createUser(req, reply));
    fastify.get('/users/:id', (req: FastifyRequest<{ Params: { id: string } }>, reply) => userController.getUser(req, reply));
};

export default userRoutes;
