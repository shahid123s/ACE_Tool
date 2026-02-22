import { ObjectId } from 'mongodb';

export interface ReportProps {
    id?: string;
    userId: string;
    aceId?: string;
    type: 'weekly' | 'monthly';
    period: string;
    driveLink: string;
    createdAt?: Date;
}

export interface ReportDTO {
    id: string;
    userId: string;
    aceId: string;
    type: 'weekly' | 'monthly';
    period: string;
    driveLink: string;
    createdAt: Date;
}

export class Report {
    public readonly id: string;
    public readonly userId: string;
    public readonly aceId: string;
    public readonly type: 'weekly' | 'monthly';
    public readonly period: string;
    public readonly driveLink: string;
    public readonly createdAt: Date;

    constructor(props: ReportProps) {
        this.id = props.id || new ObjectId().toString();
        this.userId = props.userId;
        this.aceId = props.aceId || '';
        this.type = props.type;
        this.period = props.period;
        this.driveLink = props.driveLink;
        this.createdAt = props.createdAt || new Date();

        this.validate();
    }

    private validate(): void {
        if (!this.userId) throw new Error('userId is required');
        if (!['weekly', 'monthly'].includes(this.type)) {
            throw new Error("type must be 'weekly' or 'monthly'");
        }
        if (!this.period || this.period.trim().length === 0) {
            throw new Error('period is required');
        }
        if (!this.driveLink || !this.driveLink.startsWith('http')) {
            throw new Error('Valid Google Drive/Doc link is required');
        }
    }

    public toObject(): ReportDTO {
        return {
            id: this.id,
            userId: this.userId,
            aceId: this.aceId,
            type: this.type,
            period: this.period,
            driveLink: this.driveLink,
            createdAt: this.createdAt,
        };
    }
}
