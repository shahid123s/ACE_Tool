/**
 * User Repository Interface
 * This is a contract that infrastructure layer must implement
 * @interface
 */
export class UserRepository {
    /**
     * Find user by ID
     * @param {string} id - User ID
     * @returns {Promise<User|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Save user
     * @param {User} user - User entity
     * @returns {Promise<User>}
     */
    async save(user) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete user
     * @param {string} id - User ID
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}
