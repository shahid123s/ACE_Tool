import { User } from './src/domain/user/User.js';
import { InMemoryUserRepository } from './src/infrastructure/database/InMemoryUserRepository.js';
import { CreateUser } from './src/application/user/CreateUser.js';

async function verify() {
    try {
        console.log('Verifying TypeScript migration...');

        const repo = new InMemoryUserRepository();
        const createUser = new CreateUser(repo);

        console.log('Creating user...');
        const user = await createUser.execute({
            name: 'TS User',
            email: 'ts@example.com'
        });

        console.log('User created:', user);

        if (user.name !== 'TS User') throw new Error('Name mismatch');
        if (user.role !== 'user') throw new Error('Role mismatch');

        console.log('Verification successful!');
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
