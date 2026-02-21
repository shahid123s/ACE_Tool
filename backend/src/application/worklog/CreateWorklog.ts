import { Worklog, WorklogDTO } from '../../domain/worklog/Worklog.js';
import { IWorklogRepository } from '../../domain/worklog/IWorklogRepository.js';
import { IUseCase } from '../interfaces.js';
import { AppError, ValidationError } from '../../domain/errors/index.js';

export interface CreateWorklogRequest {
    userId: string;
    date?: string; // ISO date string, defaults to today
    tasks: string[];
    hoursWorked: number;
    notes?: string;
}

export class CreateWorklog implements IUseCase<CreateWorklogRequest, WorklogDTO> {
    constructor(private readonly worklogRepository: IWorklogRepository) { }

    async execute(data: CreateWorklogRequest): Promise<WorklogDTO> {
        if (!data.tasks || data.tasks.length === 0) {
            throw new ValidationError('At least one task is required', 'tasks');
        }
        if (data.hoursWorked === undefined || data.hoursWorked === null) {
            throw new ValidationError('Hours worked is required', 'hoursWorked');
        }

        const date = data.date ? new Date(data.date) : new Date();

        // Enforce one worklog per day
        const existing = await this.worklogRepository.findByUserIdAndDate(data.userId, date);
        if (existing) {
            throw new AppError('A worklog already exists for this date. Update the existing one instead.', 409);
        }

        const worklog = new Worklog({
            id: '',
            userId: data.userId,
            date,
            tasks: data.tasks,
            hoursWorked: data.hoursWorked,
            status: 'draft',
            notes: data.notes,
        });

        const saved = await this.worklogRepository.save(worklog);
        return saved.toObject();
    }
}
