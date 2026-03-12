import { Worklog } from './Worklog.js';

export interface WorklogFilters {
    userId?: string;
    date?: Date;
    from?: Date;
    to?: Date;
    status?: 'draft' | 'submitted';
    page?: number;
    limit?: number;
}

export interface PaginatedWorklogs {
    worklogs: Worklog[];
    total: number;
}

export interface IWorklogRepository {
    save(worklog: Worklog): Promise<Worklog>;
    findById(id: string): Promise<Worklog | null>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<PaginatedWorklogs>;
    findByUserIdAndDate(userId: string, date: Date): Promise<Worklog | null>;
    findAll(filters?: WorklogFilters): Promise<PaginatedWorklogs>;
    delete(id: string): Promise<boolean>;
}
