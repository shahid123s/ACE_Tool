import { Worklog } from './Worklog.js';

export interface WorklogFilters {
    userId?: string;
    date?: Date;
    from?: Date;
    to?: Date;
    status?: 'draft' | 'submitted';
}

export interface IWorklogRepository {
    save(worklog: Worklog): Promise<Worklog>;
    findById(id: string): Promise<Worklog | null>;
    findByUserId(userId: string): Promise<Worklog[]>;
    findByUserIdAndDate(userId: string, date: Date): Promise<Worklog | null>;
    findAll(filters?: WorklogFilters): Promise<Worklog[]>;
    delete(id: string): Promise<boolean>;
}
