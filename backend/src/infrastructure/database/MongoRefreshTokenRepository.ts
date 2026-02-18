import { IRefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository.js';
import { RefreshToken, RefreshTokenProps } from '../../domain/auth/RefreshToken.js';
import { RefreshTokenModel, RefreshTokenDocument } from './schemas/RefreshTokenSchema.js';

export class MongoRefreshTokenRepository implements IRefreshTokenRepository {
    async save(refreshToken: RefreshToken): Promise<RefreshToken> {
        const { id, ...data } = refreshToken;

        // data to persistence
        const persistenceData = {
            userId: data.userId,
            tokenHash: data.tokenHash,
            familyId: data.familyId,
            issuedAt: data.issuedAt,
            expiresAt: data.expiresAt,
            revokedAt: data.revokedAt,
            replacedBy: data.replacedBy,
            ip: data.ip,
            userAgent: data.userAgent
        };

        if (id) {
            // Update existing
            const doc = await RefreshTokenModel.findByIdAndUpdate(
                id,
                { $set: persistenceData },
                { new: true }
            ).lean<RefreshTokenDocument>();

            if (!doc) throw new Error('RefreshToken not found');
            return this.mapToDomain(doc);
        } else {
            // Create new
            const newDoc = new RefreshTokenModel(persistenceData);
            await newDoc.save();
            return this.mapToDomain(newDoc.toObject());
        }
    }

    async findById(id: string): Promise<RefreshToken | null> {
        const doc = await RefreshTokenModel.findById(id).lean<RefreshTokenDocument>();
        if (!doc) return null;
        return this.mapToDomain(doc);
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const doc = await RefreshTokenModel.findOne({ tokenHash }).lean<RefreshTokenDocument>();
        if (!doc) return null;
        return this.mapToDomain(doc);
    }

    async delete(id: string): Promise<boolean> {
        const result = await RefreshTokenModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }

    async revokeFamily(familyId: string): Promise<void> {
        await RefreshTokenModel.updateMany({ familyId }, { $set: { revokedAt: new Date() } });
    }

    async revokeAllForUser(userId: string): Promise<void> {
        await RefreshTokenModel.updateMany(
            { userId, revokedAt: { $exists: false } },
            { $set: { revokedAt: new Date() } }
        );
    }

    private mapToDomain(doc: any): RefreshToken {
        const id = doc._id ? doc._id.toString() : doc.id;

        return new RefreshToken({
            id: id,
            userId: doc.userId,
            tokenHash: doc.tokenHash,
            familyId: doc.familyId,
            issuedAt: doc.issuedAt,
            expiresAt: doc.expiresAt,
            revokedAt: doc.revokedAt,
            replacedBy: doc.replacedBy,
            ip: doc.ip,
            userAgent: doc.userAgent
        });
    }
}

export const refreshTokenRepository = new MongoRefreshTokenRepository();
