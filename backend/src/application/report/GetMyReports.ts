import { ReportDTO } from '../../domain/report/Report.js';
import { IReportRepository } from '../../domain/report/IReportRepository.js';
import { IUseCase } from '../interfaces.js';

export interface GetMyReportsRequest {
    userId: string;
    type?: 'weekly' | 'monthly';
}

export class GetMyReports implements IUseCase<GetMyReportsRequest, ReportDTO[]> {
    constructor(private readonly reportRepository: IReportRepository) { }

    async execute(request: GetMyReportsRequest): Promise<ReportDTO[]> {
        const reports = await this.reportRepository.findAll({
            userId: request.userId,
            type: request.type,
        });

        return reports.map(r => r.toObject());
    }
}
