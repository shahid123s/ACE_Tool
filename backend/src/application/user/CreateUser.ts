import { User, UserDTO } from '../../domain/user/User.js';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IUseCase } from '../interfaces.js';

export interface CreateUserRequest {
    name: string;
    email: string;
}

/**
 * Create User Use Case
 */
export class CreateUser implements IUseCase<CreateUserRequest, UserDTO> {
    constructor(private readonly userRepository: IUserRepository) { }

    /**
     * Execute the use case
     * @param {CreateUserRequest} userData - { name, email }
     * @returns {Promise<UserDTO>}
     */
    async execute(userData: CreateUserRequest): Promise<UserDTO> {
        // Create domain entity (validation happens here)
        const user = new User({
            id: this.generateId(),
            name: userData.name,
            email: userData.email,
        });

        // Persist through repository
        const savedUser = await this.userRepository.save(user);

        return savedUser.toObject();
    }

    /**
     * Generate unique ID (in production, use UUID library)
     */
    private generateId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
