import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginUser, LoginRequest } from '../../../application/auth/LoginUser.js';
import { MongoUserRepository, userRepository } from '../../../infrastructure/database/MongoUserRepository.js';

export class AuthController {
    private userRepository: MongoUserRepository;

    constructor() {
        this.userRepository = userRepository;
    }

    async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            console.log(request.body, 'in authcontroller')
            const loginUser = new LoginUser(this.userRepository);
            const result = await loginUser.execute(request.body);

            return reply.send({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.log(error, 'in authcontroller')
            request.log.error(error);
            return reply.status(401).send({
                success: false,
                message: error.message
            });
        }
    }

    async register(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        // Implement register later
        return reply.status(501).send({ message: 'Not implemented' });
    }

    async getMe(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        // Implement getMe later
        return reply.status(501).send({ message: 'Not implemented' });
    }
}
