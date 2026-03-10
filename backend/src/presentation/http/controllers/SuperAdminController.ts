import { FastifyReply, FastifyRequest } from 'fastify';
import {
    InitiateAdminCreation,
    InitiateAdminCreationRequest,
} from '../../../application/superadmin/InitiateAdminCreation.js';
import {
    ConfirmAdminCreation,
    ConfirmAdminCreationRequest,
} from '../../../application/superadmin/ConfirmAdminCreation.js';

/**
 * SuperAdmin Controller
 * Handles requests that only a SuperAdmin can make.
 */
export class SuperAdminController {
    constructor(
        private readonly initiateAdminCreationUseCase: InitiateAdminCreation,
        private readonly confirmAdminCreationUseCase: ConfirmAdminCreation
    ) { }

    /**
     * Step 1: Initiate admin creation
     * POST /api/superadmin/admins/initiate
     */
    async initiateAdminCreation(
        request: FastifyRequest<{ Body: InitiateAdminCreationRequest }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const superAdminEmail = request.user!.email;
            const result = await this.initiateAdminCreationUseCase.execute({
                ...request.body,
                superAdminEmail,
            } as any);

            return reply.status(200).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            request.log.error(error);
            const statusCode = error.statusCode || 400;
            return reply.status(statusCode).send({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Step 2: Confirm admin creation with OTP
     * POST /api/superadmin/admins/confirm
     */
    async confirmAdminCreation(
        request: FastifyRequest<{ Body: { otp: string } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const superAdminEmail = request.user!.email;
            const result = await this.confirmAdminCreationUseCase.execute({
                otp: request.body.otp,
                superAdminEmail,
            });

            return reply.status(201).send({
                success: true,
                data: result,
            });
        } catch (error: any) {
            request.log.error(error);
            const statusCode = error.statusCode || 400;
            return reply.status(statusCode).send({
                success: false,
                message: error.message,
            });
        }
    }
}
