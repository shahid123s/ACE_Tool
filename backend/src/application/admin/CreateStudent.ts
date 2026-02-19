import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, UserDTO } from '../../domain/user/User.js';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IEmailService } from '../interfaces/IEmailService.js';
import { IUseCase } from '../interfaces.js';
import { ValidationError, AppError } from '../../domain/errors/index.js';

export interface CreateStudentRequest {
    aceId: string;
    name: string;
    email: string;
    phone: string;
    batch: string;
    domain: string;
    tier: 'Tier-1' | 'Tier-2' | 'Tier-3';
}

export interface CreateStudentResponse {
    user: UserDTO;
    tempPassword: string; // Returned to admin for reference (not stored plain)
}

/**
 * Create Student Use Case
 * Admin-only: creates a student, generates temp password, hashes it, saves, and emails credentials
 */
export class CreateStudent implements IUseCase<CreateStudentRequest, CreateStudentResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly emailService: IEmailService
    ) { }

    async execute(data: CreateStudentRequest): Promise<CreateStudentResponse> {
        // 1. Validate required fields
        if (!data.aceId || !data.name || !data.email || !data.phone) {
            throw new ValidationError('ACE ID, name, email, and phone are required', 'validation');
        }

        // 2. Check for duplicates
        const existingByEmail = await this.userRepository.findByEmail(data.email);
        if (existingByEmail) {
            throw new AppError('A user with this email already exists', 409);
        }

        const existingByAceId = await this.userRepository.findByAceId(data.aceId);
        if (existingByAceId) {
            throw new AppError('A student with this ACE ID already exists', 409);
        }

        // 3. Generate temp password: phone + firstName + uuid(4)
        const firstName = data.name.split(' ')[0].toLowerCase();
        const uuidSnippet = crypto.randomUUID().slice(0, 4);
        const tempPassword = `${data.phone}${firstName}${uuidSnippet}`;

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // 5. Create the User entity
        const user = new User({
            id: '', // Mongo will generate _id
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: 'user',
            aceId: data.aceId,
            phone: data.phone,
            batch: data.batch,
            domain: data.domain,
            tier: data.tier,
        });

        // 6. Save
        const savedUser = await this.userRepository.save(user);

        // 7. Send welcome email (non-blocking — won't fail the request)
        await this.emailService.sendWelcomeEmail(data.email, data.name, tempPassword, data.aceId);

        return {
            user: savedUser.toObject(),
            tempPassword, // Admin can see this in the response too
        };
    }
}
