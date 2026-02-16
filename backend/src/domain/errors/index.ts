/**
 * Base Domain Error
 * All domain errors should extend this class
 */
export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error
 * Thrown when domain validation fails
 */
export class ValidationError extends DomainError {
    public readonly field?: string;

    constructor(message: string, field?: string) {
        super(message);
        this.field = field;
    }
}

/**
 * Not Found Error
 * Thrown when a domain entity is not found
 */
export class NotFoundError extends DomainError {
    public readonly entityName: string;
    public readonly identifier: string;

    constructor(entityName: string, identifier: string) {
        super(`${entityName} with identifier ${identifier} not found`);
        this.entityName = entityName;
        this.identifier = identifier;
    }
}
