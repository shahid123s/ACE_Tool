import { WorklogDTO } from '../../domain/worklog/Worklog.js';
import { IWorklogRepository } from '../../domain/worklog/IWorklogRepository.js';
import { IUseCase } from '../interfaces.js';
import { AppError } from '../../domain/errors/index.js';

export interface SubmitWorklogRequest {
    worklogId: string;
    userId: string;
}

export class SubmitWorklog implements IUseCase<SubmitWorklogRequest, WorklogDTO> {
    constructor(private readonly worklogRepository: IWorklogRepository) { }

    async execute(data: SubmitWorklogRequest): Promise<WorklogDTO> {
        const worklog = await this.worklogRepository.findById(data.worklogId);
        if (!worklog) throw new AppError('Worklog not found', 404);

        if (worklog.userId !== data.userId) {
            throw new AppError('Forbidden', 403);
        }

        worklog.submit(); // Throws if already submitted
        const saved = await this.worklogRepository.save(worklog);
        return saved.toObject();
    }
}
