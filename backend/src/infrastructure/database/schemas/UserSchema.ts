import mongoose, { Schema, Document } from 'mongoose';
import { UserProps } from '../../../domain/user/User.js';

export interface UserDocument extends Document, Omit<UserProps, 'id'> {
    // _id is already defined in Document as unknown/any or ObjectId depending on version.
    // We can leave it as is, or if we strictly want string we must override Document<string>
    // but Mongoose Schema uses ObjectId by default.
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
}, {
    timestamps: true
});

// Create a virtual 'id' property that mirrors '_id'
UserSchema.virtual('id').get(function (this: UserDocument) {
    // Mongoose _id is technically unknown in the base definition often, 
    // but we know it's an ObjectId in this context.
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
