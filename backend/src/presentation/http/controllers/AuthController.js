import { LoginUser } from '../../../application/auth/LoginUser.js';
import { InMemoryUserRepository } from '../../../infrastructure/database/InMemoryUserRepository.js';

export class AuthController {
    constructor() {
        this.userRepository = new InMemoryUserRepository();
    }

    async login(request, reply) {
        try {
            console.log(request.body, 'in authcontroller')
            const loginUser = new LoginUser(this.userRepository);
            const result = await loginUser.execute(request.body);

            return reply.send({
                success: true,
                data: result
            });
        } catch (error) {
            console.log(error, 'in authcontroller')
            request.log.error(error);
            return reply.status(401).send({
                success: false,
                message: error.message
            });
        }
    }

    async register(request, reply) {
        // Implement register later
        return reply.status(501).send({ message: 'Not implemented' });
    }
}
