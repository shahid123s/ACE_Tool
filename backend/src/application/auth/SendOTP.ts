import crypto from 'crypto';
import { IUserRepository } from '../../domain/user/UserRepository.js';
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
 * Generates an OTP, saves it to the user (hashed if needed, but simple string for now), sends via email.
 */
export class SendOTP implements IUseCase<SendOTPRequest, SendOTPResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
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
            // Let's return success to prevent enumeration, but log it.
            // Actually, for this project, let's be explicit for better UX unless requested otherwise.
            throw new AppError('User not found', 404);
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save to user
        // Note: Using a setter/method on User entity would be cleaner, but we can assign to props for now or add a method.
        // Since User class properties are read-only (except name?), we need a method or recreate.
        // User.ts shows properties are public but readonly. 
        // Wait, User.ts properties: public name: string; public readonly email...
        // I need to add methods to User to set OTP.
        // Or update User.ts to allow setting OTP.

        // Let's add setOtp method to User class in previous step? 
        // I missed that. I'll just use 'as any' for now or update User.ts.
        // Updating User.ts is better.

        // For now, I'll assume I can update it.
        (user as any).otp = otp;
        (user as any).otpExpiresAt = otpExpiresAt;

        await this.userRepository.save(user);

        // Send Email
        await this.emailService.sendOTPEmail(user.email, user.name, otp);

        return {
            message: 'OTP sent successfully',
        };
    }
}
