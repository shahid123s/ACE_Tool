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
    public readonly createdAt: Date;

    constructor({ id, name, email, password, role, aceId, phone, batch, domain, tier, createdAt }: UserProps) {
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
            createdAt: this.createdAt,
        };
    }
}
