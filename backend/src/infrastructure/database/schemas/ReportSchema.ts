import mongoose, { Schema, Document } from 'mongoose';

export interface IReportDocument extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'weekly' | 'monthly';
    period: string;
    driveLink: string;
    createdAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['weekly', 'monthly'], required: true },
        period: { type: String, required: true },
        driveLink: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } } // We only need createdAt for reports
);

export const ReportModel = mongoose.model<IReportDocument>('Report', ReportSchema);
