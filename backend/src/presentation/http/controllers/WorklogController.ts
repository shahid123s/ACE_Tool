import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateWorklog, CreateWorklogRequest } from '../../../application/worklog/CreateWorklog.js';
import { UpdateWorklog, UpdateWorklogRequest } from '../../../application/worklog/UpdateWorklog.js';
import { SubmitWorklog } from '../../../application/worklog/SubmitWorklog.js';
import { GetMyWorklogs } from '../../../application/worklog/GetMyWorklogs.js';
import { GetTodayWorklog } from '../../../application/worklog/GetTodayWorklog.js';
import { GetAllWorklogs, GetAllWorklogsRequest } from '../../../application/worklog/GetAllWorklogs.js';
import { GetEnrichedWorklogs } from '../../../application/worklog/GetEnrichedWorklogs.js';

/**
 * Worklog Controller
 * Handles HTTP requests for both user and admin worklog routes.
 * Admin routes delegate to GetEnrichedWorklogs (which joins user data).
 * User routes use lightweight use cases with no cross-domain joins.
 */
export class WorklogController {
    constructor(
        private readonly createWorklog: CreateWorklog,
        private readonly updateWorklog: UpdateWorklog,
        private readonly submitWorklog: SubmitWorklog,
        private readonly getMyWorklogs: GetMyWorklogs,
        private readonly getTodayWorklog: GetTodayWorklog,
        private readonly getAllWorklogs: GetAllWorklogs,
        private readonly getEnrichedWorklogs?: GetEnrichedWorklogs,
    ) { }


    // ─── User Handlers ──────────────────────────────────────────────

    /**
     * POST /api/worklogs
     * Create a new worklog for the authenticated user
     */
    async create(
        request: FastifyRequest<{ Body: Omit<CreateWorklogRequest, 'userId'> }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const result = await this.createWorklog.execute({ ...request.body, userId });
            return reply.status(201).send({ success: true, data: result });
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            return reply.status(statusCode).send({ success: false, message: error.message });
        }
    }

    /**
     * PATCH /api/worklogs/:id
     * Update a worklog owned by the authenticated user
     */
    async update(
        request: FastifyRequest<{ Params: { id: string }; Body: Partial<UpdateWorklogRequest> }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const result = await this.updateWorklog.execute({
                worklogId: request.params.id,
                userId,
                ...request.body,
            });
            return reply.send({ success: true, data: result });
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            return reply.status(statusCode).send({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/worklogs/:id/submit
     * Submit a worklog owned by the authenticated user
     */
    async submit(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const result = await this.submitWorklog.execute({ worklogId: request.params.id, userId });
            return reply.send({ success: true, data: result });
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            return reply.status(statusCode).send({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/worklogs/today
     * Get today's worklog for the authenticated user
     */
    async getToday(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const result = await this.getTodayWorklog.execute({ userId });
            return reply.send({ success: true, data: result });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/worklogs
     * Get all worklogs for the authenticated user (history)
     */
    async getMine(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const result = await this.getMyWorklogs.execute({ userId });
            return reply.send({ success: true, data: result });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    // ─── Admin Handlers ──────────────────────────────────────────────

    /**
     * GET /api/admin/worklogs
     * Admin: get all worklogs with optional query filters.
     * Delegates enrichment (name, aceId, batch) to GetEnrichedWorklogs use case.
     */
    async adminGetAll(
        request: FastifyRequest<{ Querystring: GetAllWorklogsRequest & { userId?: string } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        if (!this.getEnrichedWorklogs) return reply.status(501).send({ success: false, message: 'Not configured' });
        try {
            const data = await this.getEnrichedWorklogs.execute(request.query);
            return reply.send({ success: true, data });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/admin/worklogs/:userId
     * Admin: get all worklogs for a specific user.
     */
    async adminGetByUser(
        request: FastifyRequest<{ Params: { userId: string } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        if (!this.getEnrichedWorklogs) return reply.status(501).send({ success: false, message: 'Not configured' });
        try {
            const data = await this.getEnrichedWorklogs.execute({ userId: request.params.userId });
            return reply.send({ success: true, data });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/admin/worklogs/:userId/date/:date
     * Admin: get worklog for a specific user on a specific date.
     */
    async adminGetByUserAndDate(
        request: FastifyRequest<{ Params: { userId: string; date: string } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        if (!this.getEnrichedWorklogs) return reply.status(501).send({ success: false, message: 'Not configured' });
        try {
            const { userId, date } = request.params;
            const data = await this.getEnrichedWorklogs.execute({ userId, date });
            return reply.send({ success: true, data });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }
}

