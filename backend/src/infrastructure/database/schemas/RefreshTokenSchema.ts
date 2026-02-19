import mongoose, { Schema, Document } from 'mongoose';
import { RefreshTokenProps } from '../../../domain/auth/RefreshToken.js';

export interface RefreshTokenDocument extends Document, Omit<RefreshTokenProps, 'id'> {
    // Mongoose _id is the id
}

const RefreshTokenSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, index: true }, // Index for fast lookup
    familyId: { type: String, required: true, index: true },   // Index for family revocation
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL Index
    revokedAt: { type: Date },
    replacedBy: { type: String },
    ip: { type: String },
    userAgent: { type: String }
}, {
    timestamps: true
});

// Virtual for ID
RefreshTokenSchema.virtual('id').get(function (this: any) {
    return this._id.toHexString();
});

RefreshTokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc: any, ret: any) {
        delete ret._id;
        delete ret.tokenHash; // Don't expose hash in JSON if ever returned (though it shouldn't be)
    }
});

RefreshTokenSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: function (doc: any, ret: any) {
        delete ret._id;
    }
});

export const RefreshTokenModel = mongoose.model<RefreshTokenDocument>('RefreshToken', RefreshTokenSchema);
