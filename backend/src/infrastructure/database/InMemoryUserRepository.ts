import { User, UserDTO, UserProps } from '../../domain/user/User.js';
import { IUserRepository, UserRepository } from '../../domain/user/UserRepository.js';

/**
 * In-Memory User Repository Implementation
 * In production, replace with MongoDB/PostgreSQL implementation
 */
export class InMemoryUserRepository extends UserRepository implements IUserRepository {
    private users: Map<string, UserProps>;

    constructor() {
        super();
        this.users = new Map();

        // Seed admin user
        this.users.set('1', {
            id: '1',
            name: 'Admin User',
            email: 'admin@ace.com',
            password: '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1',
            role: 'admin',
            createdAt: new Date()
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return new User(user);
            }
        }
        return null;
    }

    async findById(id: string): Promise<User | null> {
        const userData = this.users.get(id);
        if (!userData) return null;
        return new User(userData);
    }

    async save(user: User): Promise<User> {
        this.users.set(user.id, user.toPersistence());
        return user;
    }

    async delete(id: string): Promise<boolean> {
        return this.users.delete(id);
    }
}
