import { CreateUser } from '../../../application/user/CreateUser.js';
import { GetUser } from '../../../application/user/GetUser.js';
import { InMemoryUserRepository } from '../../../infrastructure/database/InMemoryUserRepository.js';

/**
 * User Controller
 * Handles HTTP requests and responses
 */
export class UserController {
    constructor() {
        // Dependency injection: inject repository into use cases
        this.userRepository = new InMemoryUserRepository();
    }

    /**
     * Create user handler
     * POST /api/users
     */
    async createUser(request, reply) {
        try {
            const createUser = new CreateUser(this.userRepository);
            const user = await createUser.execute(request.body);

            return reply.status(201).send({
                success: true,
                data: user,
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(400).send({
                success: false,
                error: error.message,
            });
        }
    }

    /**
     * Get user handler
     * GET /api/users/:id
     */
    async getUser(request, reply) {
        try {
            const getUser = new GetUser(this.userRepository);
            const user = await getUser.execute(request.params.id);

            return reply.status(200).send({
                success: true,
                data: user,
            });
        } catch (error) {
            request.log.error(error);
            const statusCode = error.name === 'NotFoundError' ? 404 : 400;
            return reply.status(statusCode).send({
                success: false,
                error: error.message,
            });
        }
    }
}
