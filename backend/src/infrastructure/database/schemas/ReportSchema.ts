import mongoose, { Schema, Document } from 'mongoose';

export interface IReportDocument extends Document {
    userId: mongoose.Types.ObjectId;
    aceId: string;
    type: 'weekly' | 'monthly';
    period: string;
    driveLink: string;
    createdAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        aceId: { type: String, default: '' },
        type: { type: String, enum: ['weekly', 'monthly'], required: true },
        period: { type: String, required: true },
        driveLink: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const ReportModel = mongoose.model<IReportDocument>('Report', ReportSchema);
