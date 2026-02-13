import { User } from '../../domain/user/User.js';

/**
 * Create User Use Case
 */
export class CreateUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Execute the use case
     * @param {Object} userData - { name, email }
     * @returns {Promise<Object>}
     */
    async execute(userData) {
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
    generateId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
