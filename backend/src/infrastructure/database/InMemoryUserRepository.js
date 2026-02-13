import { User } from '../../domain/user/User.js';
import { UserRepository } from '../../domain/user/UserRepository.js';

/**
 * In-Memory User Repository Implementation
 * In production, replace with MongoDB/PostgreSQL implementation
 */
export class InMemoryUserRepository extends UserRepository {
    constructor() {
        super();
        this.users = new Map();
    }

    async findById(id) {
        const userData = this.users.get(id);
        if (!userData) return null;
        return new User(userData);
    }

    async save(user) {
        this.users.set(user.id, user.toObject());
        return user;
    }

    async delete(id) {
        return this.users.delete(id);
    }
}
