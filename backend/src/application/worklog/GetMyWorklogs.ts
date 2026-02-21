import { WorklogDTO } from '../../domain/worklog/Worklog.js';
import { IWorklogRepository } from '../../domain/worklog/IWorklogRepository.js';
import { IUseCase } from '../interfaces.js';

export interface GetMyWorklogsRequest {
    userId: string;
}

export class GetMyWorklogs implements IUseCase<GetMyWorklogsRequest, WorklogDTO[]> {
    constructor(private readonly worklogRepository: IWorklogRepository) { }

    async execute(data: GetMyWorklogsRequest): Promise<WorklogDTO[]> {
        const worklogs = await this.worklogRepository.findByUserId(data.userId);
        return worklogs.map(w => w.toObject());
    }
}
