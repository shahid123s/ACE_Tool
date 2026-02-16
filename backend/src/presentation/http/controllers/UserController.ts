import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUser, CreateUserRequest } from '../../../application/user/CreateUser.js';
import { GetUser } from '../../../application/user/GetUser.js';
import { MongoUserRepository, userRepository } from '../../../infrastructure/database/MongoUserRepository.js';

/**
 * User Controller
 * Handles HTTP requests and responses
 */
export class UserController {
    private userRepository: MongoUserRepository;

    constructor() {
        // Dependency injection: inject repository into use cases
        this.userRepository = userRepository;
    }

    /**
     * Create user handler
     * POST /api/users
     */
    async createUser(request: FastifyRequest<{ Body: CreateUserRequest }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const createUser = new CreateUser(this.userRepository);
            const user = await createUser.execute(request.body);

            return reply.status(201).send({
                success: true,
                data: user,
            });
        } catch (error: any) {
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
    async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const getUser = new GetUser(this.userRepository);
            const user = await getUser.execute(request.params.id);

            return reply.status(200).send({
                success: true,
                data: user,
            });
        } catch (error: any) {
            request.log.error(error);
            const statusCode = error.name === 'NotFoundError' ? 404 : 400;
            return reply.status(statusCode).send({
                success: false,
                error: error.message,
            });
        }
    }
}
