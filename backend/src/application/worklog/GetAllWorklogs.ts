import { WorklogDTO } from '../../domain/worklog/Worklog.js';
import { IWorklogRepository, WorklogFilters } from '../../domain/worklog/IWorklogRepository.js';
import { IUseCase } from '../interfaces.js';

export interface GetAllWorklogsRequest {
    userId?: string;
    date?: string;    // ISO date string e.g. '2026-02-21'
    from?: string;    // ISO date range start
    to?: string;      // ISO date range end
    status?: 'draft' | 'submitted';
}

export class GetAllWorklogs implements IUseCase<GetAllWorklogsRequest, WorklogDTO[]> {
    constructor(private readonly worklogRepository: IWorklogRepository) { }

    async execute(data: GetAllWorklogsRequest): Promise<WorklogDTO[]> {
        const filters: WorklogFilters = {};

        if (data.userId) filters.userId = data.userId;
        if (data.status) filters.status = data.status;
        if (data.date) filters.date = new Date(data.date);
        if (data.from) filters.from = new Date(data.from);
        if (data.to) {
            const to = new Date(data.to);
            to.setUTCDate(to.getUTCDate() + 1); // Include the end date
            filters.to = to;
        }

        const worklogs = await this.worklogRepository.findAll(filters);
        return worklogs.map(w => w.toObject());
    }
}
