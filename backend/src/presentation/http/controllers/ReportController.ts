import { FastifyReply, FastifyRequest } from 'fastify';
import { SubmitReport, SubmitReportRequest } from '../../../application/report/SubmitReport.js';
import { GetMyReports } from '../../../application/report/GetMyReports.js';
import { GetAllEnrichedReports, GetAllEnrichedReportsFilters } from '../../../application/report/GetAllEnrichedReports.js';
import { DeleteReport } from '../../../application/report/DeleteReport.js';

export class ReportController {
    constructor(
        private readonly submitReport: SubmitReport,
        private readonly getMyReports: GetMyReports,
        private readonly deleteReport: DeleteReport,
        private readonly getAllEnrichedReports?: GetAllEnrichedReports,
    ) { }

    // ─── User Handlers ──────────────────────────────────────────────

    async submit(
        request: FastifyRequest<{ Body: Omit<SubmitReportRequest, 'userId' | 'aceId'> }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const aceId = request.user!.aceId || '';
            const result = await this.submitReport.execute({ ...request.body, userId, aceId });
            return reply.status(201).send({ success: true, data: result });
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            return reply.status(statusCode).send({ success: false, message: error.message });
        }
    }

    async getMine(
        request: FastifyRequest<{ Querystring: { type?: 'weekly' | 'monthly' } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const result = await this.getMyReports.execute({ userId, type: request.query.type });
            return reply.send({ success: true, data: result });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    async delete(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const isAdmin = request.user!.role === 'admin';
            await this.deleteReport.execute({ reportId: request.params.id, userId, isAdmin });
            return reply.send({ success: true, message: 'Report deleted successfully' });
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            return reply.status(statusCode).send({ success: false, message: error.message });
        }
    }

    // ─── Admin Handlers ──────────────────────────────────────────────

    async adminGetAll(
        request: FastifyRequest<{ Querystring: GetAllEnrichedReportsFilters }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        if (!this.getAllEnrichedReports) return reply.status(501).send({ success: false, message: 'Not configured' });
        try {
            const data = await this.getAllEnrichedReports.execute(request.query);
            return reply.send({ success: true, data });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }
}
