import { IReportRepository } from '../../domain/report/IReportRepository.js';
import { IUseCase } from '../interfaces.js';

export interface DeleteReportRequest {
    reportId: string;
    userId: string; // The user requesting the deletion
    isAdmin: boolean;
}

export class DeleteReport implements IUseCase<DeleteReportRequest, void> {
    constructor(private readonly reportRepository: IReportRepository) { }

    async execute(request: DeleteReportRequest): Promise<void> {
        const report = await this.reportRepository.findById(request.reportId);
        if (!report) {
            throw Object.assign(new Error('Report not found'), { statusCode: 404 });
        }

        if (!request.isAdmin && report.userId !== request.userId) {
            throw Object.assign(new Error('You can only delete your own reports'), { statusCode: 403 });
        }

        await this.reportRepository.delete(request.reportId);
    }
}
