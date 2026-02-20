import crypto from 'crypto';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IOtpRepository } from '../../domain/auth/IOtpRepository.js';
import { IEmailService } from '../interfaces/IEmailService.js';
import { IUseCase } from '../interfaces.js';
import { AppError, ValidationError } from '../../domain/errors/index.js';

export interface SendOTPRequest {
    email: string;
}

export interface SendOTPResponse {
    message: string;
}

/**
 * Send OTP Use Case
 * Generates an OTP, saves it to Redis with TTL, sends via email.
 */
export class SendOTP implements IUseCase<SendOTPRequest, SendOTPResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly otpRepository: IOtpRepository,
        private readonly emailService: IEmailService
    ) { }

    async execute(data: SendOTPRequest): Promise<SendOTPResponse> {
        if (!data.email) {
            throw new ValidationError('Email is required', 'email');
        }

        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            // Security: Don't reveal user existence? 
            // For now, let's just return success or specific error. 
            // Usually good to be vague, but for internal tools/mvp, specific is helpful.
            throw new AppError('User not found', 404);
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const ttlSeconds = 15 * 60; // 15 minutes

        // Save to Redis
        await this.otpRepository.save(user.email, otp, ttlSeconds);

        // Send Email
        await this.emailService.sendOTPEmail(user.email, user.name, otp);

        return {
            message: 'OTP sent successfully',
        };
    }
}
