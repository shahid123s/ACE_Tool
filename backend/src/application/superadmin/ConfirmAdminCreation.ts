import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, UserDTO } from '../../domain/user/User.js';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IOtpRepository } from '../../domain/auth/IOtpRepository.js';
import { IEmailService } from '../interfaces/IEmailService.js';
import { IUseCase } from '../interfaces.js';
import { AppError, ValidationError } from '../../domain/errors/index.js';

export interface ConfirmAdminCreationRequest {
    otp: string;
    superAdminEmail: string;
}

export interface ConfirmAdminCreationResponse {
    user: UserDTO;
    tempPassword: string;
}

/**
 * ConfirmAdminCreation Use Case
 * SuperAdmin-only: Verifies the OTP, retrieves pending admin data from Redis,
 * creates the admin user, and emails credentials to the new admin.
 */
export class ConfirmAdminCreation
    implements IUseCase<ConfirmAdminCreationRequest, ConfirmAdminCreationResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly otpRepository: IOtpRepository,
        private readonly emailService: IEmailService
    ) { }

    async execute(data: ConfirmAdminCreationRequest): Promise<ConfirmAdminCreationResponse> {
        if (!data.otp) {
            throw new ValidationError('OTP is required', 'otp');
        }

        const otpKey = `admin-creation:${data.superAdminEmail}`;
        const pendingKey = `pending-admin:${data.superAdminEmail}`;

        // 1. Verify OTP
        const storedOtp = await this.otpRepository.get(otpKey);
        if (!storedOtp || storedOtp !== data.otp) {
            throw new AppError('Invalid or expired OTP', 400);
        }

        // 2. Retrieve pending admin data
        const pendingRaw = await this.otpRepository.get(pendingKey);
        if (!pendingRaw) {
            throw new AppError('Admin creation session expired. Please initiate again.', 400);
        }

        const pending: { name: string; email: string } = JSON.parse(pendingRaw);

        // 3. Double-check email uniqueness (race condition guard)
        const existing = await this.userRepository.findByEmail(pending.email);
        if (existing) {
            throw new AppError('A user with this email already exists', 409);
        }

        // 4. Clean up Redis
        await this.otpRepository.delete(otpKey);
        await this.otpRepository.delete(pendingKey);

        // 5. Generate temp password
        const uuidSnippet = crypto.randomUUID().slice(0, 8);
        const tempPassword = `Admin@${uuidSnippet}`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // 6. Create Admin user
        const adminUser = new User({
            id: '',
            name: pending.name,
            email: pending.email,
            password: hashedPassword,
            role: 'admin',
            isTemporaryPassword: true,
        });

        const savedUser = await this.userRepository.save(adminUser);

        // 7. Email credentials to the new admin (aceId = 'ADMIN' as placeholder)
        await this.emailService.sendWelcomeEmail(
            pending.email,
            pending.name,
            tempPassword,
            'ADMIN'
        );

        return {
            user: savedUser.toObject(),
            tempPassword,
        };
    }
}
