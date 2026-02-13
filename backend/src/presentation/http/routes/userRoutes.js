import { UserController } from '../controllers/UserController.js';

const userController = new UserController();

/**
 * User routes
 * @param {FastifyInstance} fastify
 */
export default async function userRoutes(fastify) {
    // Health check
    fastify.get('/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // User routes
    fastify.post('/users', (req, reply) => userController.createUser(req, reply));
    fastify.get('/users/:id', (req, reply) => userController.getUser(req, reply));
}
