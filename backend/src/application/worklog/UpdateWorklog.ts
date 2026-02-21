import { WorklogDTO } from '../../domain/worklog/Worklog.js';
import { IWorklogRepository } from '../../domain/worklog/IWorklogRepository.js';
import { IUseCase } from '../interfaces.js';
import { AppError, ValidationError } from '../../domain/errors/index.js';

export interface UpdateWorklogRequest {
    worklogId: string;
    userId: string; // Used to verify ownership
    tasks?: string[];
    hoursWorked?: number;
    notes?: string;
}

export class UpdateWorklog implements IUseCase<UpdateWorklogRequest, WorklogDTO> {
    constructor(private readonly worklogRepository: IWorklogRepository) { }

    async execute(data: UpdateWorklogRequest): Promise<WorklogDTO> {
        const worklog = await this.worklogRepository.findById(data.worklogId);
        if (!worklog) throw new AppError('Worklog not found', 404);

        // Ownership check
        if (worklog.userId !== data.userId) {
            throw new AppError('Forbidden', 403);
        }

        // Cannot update a submitted worklog
        if (worklog.status === 'submitted') {
            throw new ValidationError('Cannot update a submitted worklog', 'status');
        }

        if (data.tasks !== undefined) {
            if (data.tasks.length === 0) throw new ValidationError('At least one task is required', 'tasks');
            worklog.tasks = data.tasks;
        }
        if (data.hoursWorked !== undefined) worklog.hoursWorked = data.hoursWorked;
        if (data.notes !== undefined) worklog.notes = data.notes;

        const saved = await this.worklogRepository.save(worklog);
        return saved.toObject();
    }
}
