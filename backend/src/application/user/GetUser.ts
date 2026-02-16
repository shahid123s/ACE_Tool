import { UserDTO } from '../../domain/user/User.js';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { NotFoundError } from '../../domain/errors/index.js';
import { IUseCase } from '../interfaces.js';

/**
 * Get User Use Case
 * Application layer orchestrates domain logic
 */
export class GetUser implements IUseCase<string, UserDTO> {
    constructor(private readonly userRepository: IUserRepository) { }

    /**
     * Execute the use case
     * @param {string} userId
     * @returns {Promise<UserDTO>}
     */
    async execute(userId: string): Promise<UserDTO> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError('User', userId);
        }

        return user.toObject();
    }
}
