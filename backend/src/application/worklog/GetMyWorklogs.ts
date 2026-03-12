import { WorklogDTO } from '../../domain/worklog/Worklog.js';
import { IWorklogRepository } from '../../domain/worklog/IWorklogRepository.js';
import { IUseCase } from '../interfaces.js';

export interface GetMyWorklogsRequest {
    userId: string;
    page?: number;
    limit?: number;
}

export interface PaginatedWorklogDTO {
    worklogs: WorklogDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class GetMyWorklogs implements IUseCase<GetMyWorklogsRequest, PaginatedWorklogDTO> {
    constructor(private readonly worklogRepository: IWorklogRepository) { }

    async execute(data: GetMyWorklogsRequest): Promise<PaginatedWorklogDTO> {
        const page = data.page || 1;
        const limit = data.limit || 10;

        const result = await this.worklogRepository.findByUserId(data.userId, page, limit);

        return {
            worklogs: result.worklogs.map(w => w.toObject()),
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit)
        };
    }
}
