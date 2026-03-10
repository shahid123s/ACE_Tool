import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, UserDTO } from '../../domain/user/User.js';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IEmailService } from '../interfaces/IEmailService.js';
import { IUseCase } from '../interfaces.js';
import { CreateStudentRequest } from './CreateStudent.js';

export interface CreateStudentsBulkRequest {
    students: CreateStudentRequest[];
}

export interface FailedStudent {
    student: CreateStudentRequest;
    reason: string;
}

export interface SuccessfulStudent {
    user: UserDTO;
    tempPassword: string;
}

export interface CreateStudentsBulkResponse {
    successful: SuccessfulStudent[];
    failed: FailedStudent[];
}

/**
 * Bulk Create Students Use Case
 * Admin-only: creates multiple students, generates temp passwords, hashes them, saves, and emails credentials
 */
export class CreateStudentsBulk implements IUseCase<CreateStudentsBulkRequest, CreateStudentsBulkResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly emailService: IEmailService
    ) { }

    async execute(data: CreateStudentsBulkRequest): Promise<CreateStudentsBulkResponse> {
        const successful: SuccessfulStudent[] = [];
        const failed: FailedStudent[] = [];

        if (!data.students || !Array.isArray(data.students)) {
            throw new Error('Invalid payload: students must be an array');
        }

        for (const studentData of data.students) {
            try {
                // 1. Validate required fields
                if (!studentData.aceId || !studentData.name || !studentData.email || !studentData.phone) {
                    failed.push({ student: studentData, reason: 'ACE ID, name, email, and phone are required' });
                    continue;
                }

                // 2. Check for duplicates
                const existingByEmail = await this.userRepository.findByEmail(studentData.email);
                if (existingByEmail) {
                    failed.push({ student: studentData, reason: 'A user with this email already exists' });
                    continue;
                }

                const existingByAceId = await this.userRepository.findByAceId(studentData.aceId);
                if (existingByAceId) {
                    failed.push({ student: studentData, reason: 'A student with this ACE ID already exists' });
                    continue;
                }

                // 3. Generate temp password: phone + firstName + uuid(4)
                const firstName = studentData.name.split(' ')[0].toLowerCase();
                const uuidSnippet = crypto.randomUUID().slice(0, 4);
                const tempPassword = `${studentData.phone}${firstName}${uuidSnippet}`;

                // 4. Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(tempPassword, salt);

                // 5. Create the User entity
                const user = new User({
                    id: '', // Mongo will generate _id
                    name: studentData.name,
                    email: studentData.email,
                    password: hashedPassword,
                    role: 'user',
                    aceId: studentData.aceId,
                    phone: studentData.phone,
                    batch: studentData.batch,
                    domain: studentData.domain,
                    tier: studentData.tier,
                });

                // 6. Save
                const savedUser = await this.userRepository.save(user);

                // 7. Send welcome email (non-blocking)
                await this.emailService.sendWelcomeEmail(studentData.email, studentData.name, tempPassword, studentData.aceId).catch(err => {
                    console.error(`Failed to send welcome email to ${studentData.email}:`, err);
                });

                successful.push({
                    user: savedUser.toObject(),
                    tempPassword,
                });
            } catch (error: any) {
                failed.push({ student: studentData, reason: error.message || 'Unknown error occurred' });
            }
        }

        return { successful, failed };
    }
}
