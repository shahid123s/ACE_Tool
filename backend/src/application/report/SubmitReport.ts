import { Report, ReportDTO } from '../../domain/report/Report.js';
import { IReportRepository } from '../../domain/report/IReportRepository.js';
import { IUseCase } from '../interfaces.js';

export interface SubmitReportRequest {
    userId: string;
    aceId?: string;
    type: 'weekly' | 'monthly';
    period: string;
    driveLink: string;
}

export class SubmitReport implements IUseCase<SubmitReportRequest, ReportDTO> {
    constructor(private readonly reportRepository: IReportRepository) { }

    async execute(request: SubmitReportRequest): Promise<ReportDTO> {
        const existing = await this.reportRepository.findByUserAndTypeAndPeriod(request.userId, request.type, request.period);
        if (existing) {
            throw new Error(`You have already submitted a ${request.type} report for ${request.period}.`);
        }

        const report = new Report({
            userId: request.userId,
            aceId: request.aceId || '',
            type: request.type,
            period: request.period,
            driveLink: request.driveLink,
        });

        const savedReport = await this.reportRepository.save(report);
        return savedReport.toObject();
    }
}
