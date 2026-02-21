import { ReportDTO } from '../../domain/report/Report.js';
import { IReportRepository, ReportFilters } from '../../domain/report/IReportRepository.js';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IUseCase } from '../interfaces.js';

export interface GetAllEnrichedReportsFilters {
    userId?: string;
    type?: 'weekly' | 'monthly';
}

export interface EnrichedReportDTO extends ReportDTO {
    userName?: string;
    aceId?: string;
    batch?: string;
}

export class GetAllEnrichedReports implements IUseCase<GetAllEnrichedReportsFilters, EnrichedReportDTO[]> {
    constructor(
        private readonly reportRepository: IReportRepository,
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(filters: GetAllEnrichedReportsFilters): Promise<EnrichedReportDTO[]> {
        const reports = await this.reportRepository.findAll(filters);
        if (reports.length === 0) return [];

        const uniqueUserIds = [...new Set(reports.map((r) => r.userId))];
        const allUsers = await this.userRepository.findAll();
        const userMap = new Map(
            allUsers
                .filter((u) => uniqueUserIds.includes(u.id))
                .map((u) => [u.id, u])
        );

        return reports.map((r) => {
            const dto = r.toObject();
            const user = userMap.get(r.userId);
            return {
                ...dto,
                userName: user?.name,
                aceId: user?.aceId,
                batch: user?.batch,
            };
        });
    }
}
