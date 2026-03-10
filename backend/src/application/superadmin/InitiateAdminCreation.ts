import crypto from 'crypto';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IOtpRepository } from '../../domain/auth/IOtpRepository.js';
import { IEmailService } from '../interfaces/IEmailService.js';
import { IUseCase } from '../interfaces.js';
import { AppError, ValidationError } from '../../domain/errors/index.js';

export interface InitiateAdminCreationRequest {
    name: string;
    email: string;
}

export interface InitiateAdminCreationResponse {
    message: string;
}

/**
 * InitiateAdminCreation Use Case
 * SuperAdmin-only: Stores pending admin details in Redis and emails an OTP to
 * the SuperAdmin for confirmation before creating the admin account.
 */
export class InitiateAdminCreation
    implements IUseCase<InitiateAdminCreationRequest, InitiateAdminCreationResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly otpRepository: IOtpRepository,
        private readonly emailService: IEmailService
    ) { }

    async execute(
        data: InitiateAdminCreationRequest & { superAdminEmail: string }
    ): Promise<InitiateAdminCreationResponse> {
        if (!data.name || !data.email) {
            throw new ValidationError('Name and email are required', 'body');
        }

        // Check if target email is already taken
        const existing = await this.userRepository.findByEmail(data.email);
        if (existing) {
            throw new AppError('A user with this email already exists', 409);
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const ttlSeconds = 15 * 60; // 15 minutes

        // Store OTP keyed by superadmin email under a distinct namespace
        await this.otpRepository.save(`admin-creation:${data.superAdminEmail}`, otp, ttlSeconds);

        // Store pending admin data as a simple JSON string via OTP repo (reuse same Redis)
        await this.otpRepository.save(
            `pending-admin:${data.superAdminEmail}`,
            JSON.stringify({ name: data.name, email: data.email }),
            ttlSeconds
        );

        // Send OTP to the SuperAdmin's email
        await this.emailService.sendAdminCreationOtpEmail(
            data.superAdminEmail,
            data.name,
            otp
        );

        return {
            message: 'OTP sent to your (SuperAdmin) email. Use it to confirm admin creation.',
        };
    }
}
