import mongoose, { Schema, Document } from 'mongoose';
import { BlogPlatform } from '../../../domain/blogpost/BlogPost.js';

export interface IAdminScoreDocument {
    adminId: mongoose.Types.ObjectId;
    adminName: string;
    score: number;
    scoredAt: Date;
}

export interface IBlogPostDocument extends Document {
    userId: mongoose.Types.ObjectId;
    aceId: string;
    title: string;
    link: string;
    platform: BlogPlatform;
    submittedAt: Date;
    scores: IAdminScoreDocument[];
}

const AdminScoreSchema = new Schema<IAdminScoreDocument>(
    {
        adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        adminName: { type: String, required: true },
        score: { type: Number, required: true, min: 0, max: 10 },
        scoredAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const BlogPostSchema = new Schema<IBlogPostDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        aceId: { type: String, default: '' },
        title: { type: String, required: true },
        link: { type: String, required: true },
        platform: {
            type: String,
            enum: ['linkedin', 'x', 'devto', 'medium', 'hashnode', 'other'],
            required: true,
        },
        scores: { type: [AdminScoreSchema], default: [] },
    },
    { timestamps: { createdAt: 'submittedAt', updatedAt: false } }
);

export const BlogPostModel = mongoose.model<IBlogPostDocument>('BlogPost', BlogPostSchema);
