import { AuthController } from "../controllers/AuthController.js";

const authController = new AuthController();

/**
 * Authentication routes
 * @param {FastifyInstance} fastify
 */
export default async function authRoutes(fastify) {
    // Authentication routes
    fastify.post('/login', (req, reply) => authController.login(req, reply));
    fastify.post('/register', (req, reply) => authController.register(req, reply));
}