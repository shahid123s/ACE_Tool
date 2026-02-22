import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ReportController } from '../controllers/ReportController.js';
import { SubmitReport } from '../../../application/report/SubmitReport.js';
import { GetMyReports } from '../../../application/report/GetMyReports.js';
import { DeleteReport } from '../../../application/report/DeleteReport.js';
import { reportRepository } from '../../../infrastructure/database/MongoReportRepository.js';
import { authenticate } from '../middleware/authenticate.js';

/**
 * User Report Routes
 * All routes require authentication
 */
const reportRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Use cases (no admin use cases here to keep it lean)
    const controller = new ReportController(
        new SubmitReport(reportRepository),
        new GetMyReports(reportRepository),
        new DeleteReport(reportRepository)
    );

    // Authenticate all user report routes
    fastify.addHook('preHandler', authenticate);

    // Routes
    fastify.post('/', controller.submit.bind(controller));
    fastify.get('/', controller.getMine.bind(controller));
    fastify.delete('/:id', controller.delete.bind(controller));
};

export default reportRoutes;
