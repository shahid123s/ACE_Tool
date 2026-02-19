import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/user/UserRepository.js';
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
 * Verifies OTP and updates password.
 */
export class ResetPassword implements IUseCase<ResetPasswordRequest, ResetPasswordResponse> {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        if (!data.email || !data.otp || !data.newPassword) {
            throw new ValidationError('Email, OTP, and new password are required', 'validation');
        }

        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        console.log(user, data.otp, data, 'ivda nokkane ashanee ,, in src/application/auth/ResetPassword.ts');
        
        console.log(user.otp !== data.otp)

        // Verify OTP
        if (!user.otp || user.otp !== data.otp) {
            throw new AppError('Invalid OTP', 400);
        }

        // Verify Expiry
        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            throw new AppError('OTP expired', 400);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.newPassword, salt);

        // Update User
        // Again, assuming I can update properties.
        // User.ts has 'password' as readonly?
        (user as any).password = hashedPassword;
        (user as any).otp = undefined; // Clear OTP
        (user as any).otpExpiresAt = undefined;

        await this.userRepository.save(user);

        return {
            message: 'Password reset successfully',
        };
    }
}
