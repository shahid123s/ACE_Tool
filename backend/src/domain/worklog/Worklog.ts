import { ValidationError } from '../errors/index.js';

export interface WorklogProps {
    id: string;
    userId: string;
    date: Date;
    tasks: string[];
    hoursWorked: number;
    status: 'draft' | 'submitted';
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface WorklogDTO {
    id: string;
    userId: string;
    date: Date;
    tasks: string[];
    hoursWorked: number;
    status: 'draft' | 'submitted';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Worklog Entity — Domain Model
 * One worklog per user per date.
 * A worklog holds the list of tasks completed that day.
 */
export class Worklog {
    public readonly id: string;
    public readonly userId: string;
    public readonly date: Date;
    public tasks: string[];
    public hoursWorked: number;
    public status: 'draft' | 'submitted';
    public notes?: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(props: WorklogProps) {
        this.id = props.id;
        this.userId = props.userId;
        this.date = this.normalizeDate(props.date);
        this.tasks = props.tasks || [];
        this.hoursWorked = props.hoursWorked ?? 0;
        this.status = props.status || 'draft';
        this.notes = props.notes;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();

        this.validate();
    }

    private validate(): void {
        if (!this.userId) throw new ValidationError('User ID is required', 'userId');
        if (!this.date) throw new ValidationError('Date is required', 'date');
        if (this.tasks.length === 0) throw new ValidationError('At least one task is required', 'tasks');
        if (this.hoursWorked < 0 || this.hoursWorked > 24) {
            throw new ValidationError('Hours worked must be between 0 and 24', 'hoursWorked');
        }
    }

    /**
     * Normalise to midnight UTC so date comparisons work correctly
     */
    private normalizeDate(date: Date): Date {
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0);
        return d;
    }

    public submit(): void {
        if (this.status === 'submitted') {
            throw new ValidationError('Worklog is already submitted', 'status');
        }
        this.status = 'submitted';
    }

    public toObject(): WorklogDTO {
        return {
            id: this.id,
            userId: this.userId,
            date: this.date,
            tasks: this.tasks,
            hoursWorked: this.hoursWorked,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    public toPersistence(): WorklogProps {
        return {
            id: this.id,
            userId: this.userId,
            date: this.date,
            tasks: this.tasks,
            hoursWorked: this.hoursWorked,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
