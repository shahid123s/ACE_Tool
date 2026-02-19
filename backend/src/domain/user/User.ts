import { ValidationError } from '../errors/index.js';

/**
 * User Entity - Domain Model
 * Contains business logic and rules
 */
export interface UserProps {
    id: string;
    name: string;
    email: string;
    password?: string;
    role?: 'user' | 'admin';
    aceId?: string;
    phone?: string;
    batch?: string;
    domain?: string;
    tier?: string;
    stage?: 'Placement' | 'Boarding week' | 'TOI' | 'Project' | '2 FD' | '1 FD' | 'Placed';
    status?: 'ongoing' | 'removed' | 'break' | 'hold' | 'placed';
    otp?: string;
    otpExpiresAt?: Date;
    createdAt?: Date;
}

export interface UserDTO {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    aceId?: string;
    phone?: string;
    batch?: string;
    domain?: string;
    tier?: string;
    stage?: 'Placement' | 'Boarding week' | 'TOI' | 'Project' | '2 FD' | '1 FD' | 'Placed';
    status: 'ongoing' | 'removed' | 'break' | 'hold' | 'placed';
    createdAt: Date;
}

export class User {
    public readonly id: string;
    public name: string;
    public readonly email: string;
    public readonly password?: string; // Hashed password
    public readonly role: 'user' | 'admin';
    public readonly aceId?: string;
    public readonly phone?: string;
    public readonly batch?: string;
    public readonly domain?: string;
    public readonly tier?: string;
    public readonly stage?: 'Placement' | 'Boarding week' | 'TOI' | 'Project' | '2 FD' | '1 FD' | 'Placed';
    public readonly status: 'ongoing' | 'removed' | 'break' | 'hold' | 'placed';
    public readonly otp?: string;
    public readonly otpExpiresAt?: Date;
    public readonly createdAt: Date;

    constructor({ id, name, email, password, role, aceId, phone, batch, domain, tier, stage, status, otp, otpExpiresAt, createdAt }: UserProps) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role || 'user';
        this.aceId = aceId;
        this.phone = phone;
        this.batch = batch;
        this.domain = domain;
        this.tier = tier;
        this.stage = stage || 'Boarding week';
        this.status = status || 'ongoing';
        this.otp = otp;
        this.otpExpiresAt = otpExpiresAt;
        this.createdAt = createdAt || new Date();

        this.validate();
    }

    /**
     * Business rule: Validate user data
     */
    private validate(): void {
        if (!this.name || this.name.trim().length === 0) {
            throw new ValidationError('Name is required', 'name');
        }

        if (!this.email || !this.isValidEmail(this.email)) {
            throw new ValidationError('Valid email is required', 'email');
        }
    }

    /**
     * Business rule: Email validation
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Update user name
     * @param {string} newName
     */
    public updateName(newName: string): void {
        if (!newName || newName.trim().length === 0) {
            throw new ValidationError('Name cannot be empty', 'name');
        }
        this.name = newName;
    }

    /**
     * Convert to plain object for public display (no password)
     */
    public toObject(): UserDTO {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            aceId: this.aceId,
            phone: this.phone,
            batch: this.batch,
            domain: this.domain,
            tier: this.tier,
            stage: this.stage,
            status: this.status,
            createdAt: this.createdAt,
        };
    }

    /**
     * Convert to plain object for persistence (includes password)
     */
    public toPersistence(): UserProps {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role,
            aceId: this.aceId,
            phone: this.phone,
            batch: this.batch,
            domain: this.domain,
            tier: this.tier,
            stage: this.stage,
            status: this.status,
            otp: this.otp,
            otpExpiresAt: this.otpExpiresAt,
            createdAt: this.createdAt,
        };
    }
}
