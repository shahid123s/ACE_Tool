/**
 * Email Service Interface (Application Layer Port)
 * Infrastructure layer must implement this
 */
export interface IEmailService {
    sendWelcomeEmail(to: string, name: string, tempPassword: string, aceId: string): Promise<void>;
    sendOTPEmail(to: string, name: string, otp: string): Promise<void>;
}
