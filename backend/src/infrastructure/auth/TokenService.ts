import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../../config/env.js';
import { UserDTO } from '../../domain/user/User.js';

export class TokenService {
    // Access Token (JWT)
    static generateAccessToken(user: UserDTO): string {
        return jwt.sign(
            {
                sub: user.id, // Subject (User ID)
                email: user.email,
                role: user.role,
                iss: 'ace-platform',
                aud: 'ace-frontend'
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
        );
    }

    static verifyAccessToken(token: string): any {
        return jwt.verify(token, config.jwt.secret);
    }

    // Refresh Token (Opaque / Random String)
    static generateRefreshToken(): string {
        return crypto.randomBytes(40).toString('hex');
    }

    static hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    // Family ID Generation
    static generateFamilyId(): string {
        return crypto.randomUUID();
    }
}
