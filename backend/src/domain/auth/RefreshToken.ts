import { ValidationError } from '../errors/index.js';

export interface RefreshTokenProps {
    id: string; // The token string itself (opaque) or a specific ID? 
    // Plan said: id, userId, tokenHash. 
    // So 'id' is db ID. 'tokenHash' is the hashed token.
    userId: string;
    tokenHash: string;
    familyId: string;
    issuedAt: Date;
    expiresAt: Date;
    revokedAt?: Date;
    replacedBy?: string; // Token ID that replaced this one
    ip?: string;
    userAgent?: string;
}

export class RefreshToken {
    public readonly id: string;
    public readonly userId: string;
    public readonly tokenHash: string;
    public readonly familyId: string;
    public readonly issuedAt: Date;
    public readonly expiresAt: Date;
    public revokedAt?: Date;
    public replacedBy?: string;
    public readonly ip?: string;
    public readonly userAgent?: string;

    constructor(props: RefreshTokenProps) {
        this.id = props.id;
        this.userId = props.userId;
        this.tokenHash = props.tokenHash;
        this.familyId = props.familyId;
        this.issuedAt = props.issuedAt;
        this.expiresAt = props.expiresAt;
        this.revokedAt = props.revokedAt;
        this.replacedBy = props.replacedBy;
        this.ip = props.ip;
        this.userAgent = props.userAgent;

        this.validate();
    }

    private validate(): void {
        if (!this.userId) throw new ValidationError('User ID is required', 'userId');
        if (!this.tokenHash) throw new ValidationError('Token hash is required', 'tokenHash');
        if (!this.familyId) throw new ValidationError('Family ID is required', 'familyId');
    }

    public isRevoked(): boolean {
        return !!this.revokedAt;
    }

    public isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    public isValid(): boolean {
        return !this.isRevoked() && !this.isExpired();
    }

    public revoke(replacedByTokenId?: string): void {
        this.revokedAt = new Date();
        if (replacedByTokenId) {
            this.replacedBy = replacedByTokenId;
        }
    }
}
