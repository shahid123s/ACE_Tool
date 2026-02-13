import { ValidationError } from '../errors/index.js';

/**
 * User Entity - Domain Model
 * Contains business logic and rules
 */
export class User {
    constructor({ id, name, email, createdAt }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt || new Date();

        this.validate();
    }

    /**
     * Business rule: Validate user data
     */
    validate() {
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
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Update user name
     * @param {string} newName
     */
    updateName(newName) {
        if (!newName || newName.trim().length === 0) {
            throw new ValidationError('Name cannot be empty', 'name');
        }
        this.name = newName;
    }

    /**
     * Convert to plain object
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt,
        };
    }
}
