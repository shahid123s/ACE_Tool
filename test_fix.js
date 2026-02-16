import { User } from './backend/src/domain/user/User.js';

try {
    const user = new User({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
        createdAt: new Date()
    });
    console.log('User created successfully:', user.name);
    if (user.password !== 'hashedpassword') {
        throw new Error('Password not set correctly');
    }
    if (user.role !== 'user') {
        throw new Error('Role not set correctly');
    }
} catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
}
