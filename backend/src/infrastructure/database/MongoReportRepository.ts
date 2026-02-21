import { IReportRepository, ReportFilters } from '../../domain/report/IReportRepository.js';
import { Report } from '../../domain/report/Report.js';
import { ReportModel } from './schemas/ReportSchema.js';

export class MongoReportRepository implements IReportRepository {
    async findAll(filters?: ReportFilters): Promise<Report[]> {
        const query: any = {};
        if (filters?.userId) query.userId = filters.userId;
        if (filters?.type) query.type = filters.type;

        // Sort by newest first
        const docs = await ReportModel.find(query).sort({ createdAt: -1 });
        return docs.map(this.mapToDomain);
    }

    async findByUserAndTypeAndPeriod(userId: string, type: 'weekly' | 'monthly', period: string): Promise<Report | null> {
        const doc = await ReportModel.findOne({ userId, type, period });
        if (!doc) return null;
        return this.mapToDomain(doc);
    }

    async findById(id: string): Promise<Report | null> {
        const doc = await ReportModel.findById(id);
        if (!doc) return null;
        return this.mapToDomain(doc);
    }

    async save(report: Report): Promise<Report> {
        const data = {
            userId: report.userId,
            type: report.type,
            period: report.period,
            driveLink: report.driveLink,
            createdAt: report.createdAt,
        };

        const doc = await ReportModel.findByIdAndUpdate(
            report.id,
            { $set: data },
            { new: true, upsert: true }
        );

        return this.mapToDomain(doc);
    }

    async delete(id: string): Promise<void> {
        await ReportModel.findByIdAndDelete(id);
    }

    private mapToDomain(doc: any): Report {
        return new Report({
            id: doc._id.toString(),
            userId: doc.userId.toString(),
            type: doc.type,
            period: doc.period,
            driveLink: doc.driveLink,
            createdAt: doc.createdAt,
        });
    }
}

export const reportRepository = new MongoReportRepository();
