import { User } from '../../domain/user/User.js';
import { NotFoundError } from '../../domain/errors/index.js';

/**
 * Get User Use Case
 * Application layer orchestrates domain logic
 */
export class GetUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Execute the use case
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async execute(userId) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError('User', userId);
        }

        return user.toObject();
    }
}
