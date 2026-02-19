import nodemailer from 'nodemailer';
import { IEmailService } from '../../application/interfaces/IEmailService.js';

/**
 * Nodemailer Email Service
 * Implements IEmailService using SMTP
 */
export class NodemailerEmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendWelcomeEmail(to: string, name: string, tempPassword: string, aceId: string): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@ace-platform.com',
            to,
            subject: `Welcome to ACE Platform - Your Account (${aceId})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Welcome to ACE Platform!</h2>
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>Your account has been created on the ACE Platform. Here are your login credentials:</p>
                    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>ACE ID:</strong> ${aceId}</p>
                        <p style="margin: 4px 0;"><strong>Email:</strong> ${to}</p>
                        <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
                    </div>
                    <p style="color: #e74c3c;"><strong>Important:</strong> Please change your password after your first login.</p>
                    <p>Best regards,<br/>ACE Platform Admin</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            // Don't throw — student creation should succeed even if email fails
            // The admin can resend later
        }
    }
}

export const emailService = new NodemailerEmailService();
