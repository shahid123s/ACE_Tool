import { Report } from './Report.js';

export interface ReportFilters {
    userId?: string;
    type?: 'weekly' | 'monthly';
}

export interface IReportRepository {
    /**
     * Finds reports matching the given optional filters.
     * Returned reports should be sorted chronologically descending.
     */
    findAll(filters?: ReportFilters): Promise<Report[]>;

    /**
     * Finds a specific report for duplicate prevention.
     */
    findByUserAndTypeAndPeriod(userId: string, type: 'weekly' | 'monthly', period: string): Promise<Report | null>;

    /**
     * Finds a single report by its ID.
     */
    findById(id: string): Promise<Report | null>;

    /**
     * Saves a report (insert or update).
     */
    save(report: Report): Promise<Report>;

    /**
     * Deletes a report by its ID.
     */
    delete(id: string): Promise<void>;
}
