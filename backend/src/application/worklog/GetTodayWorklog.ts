import { WorklogDTO } from '../../domain/worklog/Worklog.js';
import { IWorklogRepository } from '../../domain/worklog/IWorklogRepository.js';
import { IUseCase } from '../interfaces.js';

export interface GetTodayWorklogRequest {
    userId: string;
}

export class GetTodayWorklog implements IUseCase<GetTodayWorklogRequest, WorklogDTO | null> {
    constructor(private readonly worklogRepository: IWorklogRepository) { }

    async execute(data: GetTodayWorklogRequest): Promise<WorklogDTO | null> {
        const today = new Date();
        const worklog = await this.worklogRepository.findByUserIdAndDate(data.userId, today);
        return worklog ? worklog.toObject() : null;
    }
}
