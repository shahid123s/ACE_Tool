import { WorklogDTO } from '../../domain/worklog/Worklog.js';
import { IWorklogRepository, WorklogFilters } from '../../domain/worklog/IWorklogRepository.js';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IUseCase } from '../interfaces.js';

/** Mirrors GetAllWorklogsRequest so the controller can pass query params directly */
export interface GetEnrichedWorklogsRequest {
    userId?: string;
    date?: string;   // ISO date string e.g. '2026-02-21'
    from?: string;   // ISO date range start
    to?: string;     // ISO date range end
    status?: 'draft' | 'submitted';
}

export interface EnrichedWorklogDTO extends WorklogDTO {
    userName?: string;
    aceId?: string;
    batch?: string;
}


/**
 * GetEnrichedWorklogs — Application Use Case
 *
 * Fetches all worklogs (with optional filters) and enriches each one
 * with the corresponding user's name, aceId, and batch.
 *
 * Keeps infrastructure concerns (Mongoose populate) out of the controller
 * by leveraging the domain repository interfaces.
 */
export class GetEnrichedWorklogs implements IUseCase<GetEnrichedWorklogsRequest, EnrichedWorklogDTO[]> {
    constructor(
        private readonly worklogRepository: IWorklogRepository,
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(filters: GetEnrichedWorklogsRequest): Promise<EnrichedWorklogDTO[]> {
        // 1. Convert string dates → Date for the repository layer
        const repoFilters: WorklogFilters = {
            userId: filters.userId,
            status: filters.status,
            date: filters.date ? new Date(filters.date) : undefined,
            from: filters.from ? new Date(filters.from) : undefined,
            to: filters.to ? new Date(filters.to) : undefined,
        };

        // 2. Fetch filtered worklogs
        const worklogs = await this.worklogRepository.findAll(repoFilters);
        if (worklogs.length === 0) return [];

        // 3. Collect unique userIds, then fetch matching users in one query
        const uniqueUserIds = [...new Set(worklogs.map((w) => w.userId))];
        const allUsers = await this.userRepository.findAll();
        const userMap = new Map(
            allUsers
                .filter((u) => uniqueUserIds.includes(u.id))
                .map((u) => [u.id, u])
        );

        // 4. Merge worklog DTOs with user info
        return worklogs.map((w) => {
            const dto = w.toObject();
            const user = userMap.get(w.userId);
            return {
                ...dto,
                userName: user?.name || "Unknown",
                aceId: user?.aceId || "",
                batch: user?.batch || "",
            };
        });
    }
}
