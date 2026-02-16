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

        // Seed admin user
        // password: 'password' (bcrypt hash)
        this.users.set('1', {
            id: '1',
            name: 'Admin User',
            email: 'admin@ace.com',
            password: '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', // Placeholder hash, need real one
            role: 'admin',
            createdAt: new Date()
        });
    }

    async findByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                console.log(user, 'in inmemoryuserrepo')
                return new User(user);
            }
        }
        return null;
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
