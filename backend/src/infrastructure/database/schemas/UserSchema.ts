import mongoose, { Schema, Document } from 'mongoose';
import { UserProps } from '../../../domain/user/User.js';

export interface UserDocument extends Document, Omit<UserProps, 'id'> {
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
    aceId: { type: String, unique: true, sparse: true },
    phone: { type: String },
    batch: { type: String },
    domain: { type: String },
    tier: { type: String, enum: ['Tier-1', 'Tier-2', 'Tier-3'] },
    stage: { type: String, enum: ['Placement', 'Boarding week', 'TOI', 'Project', '2 FD', '1 FD', 'Placed'], default: 'Boarding week' },
    status: { type: String, enum: ['ongoing', 'removed', 'break', 'hold', 'placed'], default: 'ongoing' },
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
}, {
    timestamps: true
});

// Create a virtual 'id' property that mirrors '_id'
UserSchema.virtual('id').get(function (this: UserDocument) {
    return (this._id as mongoose.Types.ObjectId).toHexString();
});

// Ensure virtual fields are serialised
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc: Document<unknown>, ret: Record<string, unknown>) {
        delete ret._id;
    }
});

UserSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: function (doc: Document<unknown>, ret: Record<string, unknown>) {
        delete ret._id;
    }
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
