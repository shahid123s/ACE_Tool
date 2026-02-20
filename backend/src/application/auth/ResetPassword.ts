import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IOtpRepository } from '../../domain/auth/IOtpRepository.js';
import { IUseCase } from '../interfaces.js';
import { AppError, ValidationError } from '../../domain/errors/index.js';

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

/**
 * Reset Password Use Case
 * Verifies OTP from Redis and updates password in DB.
 */
export class ResetPassword implements IUseCase<ResetPasswordRequest, ResetPasswordResponse> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly otpRepository: IOtpRepository
    ) { }

    async execute(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        if (!data.email || !data.otp || !data.newPassword) {
            throw new ValidationError('Email, OTP, and new password are required', 'validation');
        }

        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Verify OTP from Redis
        const storedOtp = await this.otpRepository.get(data.email);

        // Normalize for comparison
        const inputOtp = String(data.otp).trim();
        const validOtp = storedOtp ? String(storedOtp).trim() : null;

        console.log(inputOtp, validOtp, '❤️‍🔥')

        if (!validOtp || validOtp !== inputOtp) {
            throw new AppError('Invalid or expired OTP', 400);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.newPassword, salt);

        // Update User Password
        (user as any).password = hashedPassword;

        // Clear OTP from Redis
        await this.otpRepository.delete(data.email);

        await this.userRepository.save(user);

        return {
            message: 'Password reset successfully',
        };
    }
}
