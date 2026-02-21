import mongoose, { Schema, Document } from 'mongoose';
import { WorklogProps } from '../../../domain/worklog/Worklog.js';

export interface WorklogDocument extends Document, Omit<WorklogProps, 'id'> {
    createdAt: Date;
    updatedAt: Date;
}

const WorklogSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        tasks: { type: [String], required: true, default: [] },
        hoursWorked: { type: Number, required: true, default: 0, min: 0, max: 24 },
        status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
        notes: { type: String },
    },
    {
        timestamps: true,
    }
);

// Unique constraint: one worklog per user per date
WorklogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Virtual 'id' from '_id'
WorklogSchema.virtual('id').get(function (this: WorklogDocument) {
    return (this._id as mongoose.Types.ObjectId).toHexString();
});

WorklogSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => { delete ret._id; },
});

WorklogSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => { delete ret._id; },
});

export const WorklogModel = mongoose.model<WorklogDocument>('Worklog', WorklogSchema);
