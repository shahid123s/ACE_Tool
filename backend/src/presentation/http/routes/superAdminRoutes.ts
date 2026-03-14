import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { SuperAdminController } from '../controllers/SuperAdminController.js';
import { InitiateAdminCreation } from '../../../application/superadmin/InitiateAdminCreation.js';
import { ConfirmAdminCreation } from '../../../application/superadmin/ConfirmAdminCreation.js';
import { userRepository } from '../../../infrastructure/database/MongoUserRepository.js';
import { otpRepository } from '../../../infrastructure/redis/RedisOtpRepository.js';
import { emailService } from '../../../infrastructure/email/NodemailerEmailService.js';
import { authenticate } from '../middleware/authenticate.js';

/**
 * SuperAdmin Routes
 * All routes require authentication AND the 'superadmin' role
 * Prefix: /api/superadmin
 */
const superAdminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Instantiate use cases
    const initiateAdminCreation = new InitiateAdminCreation(userRepository, otpRepository, emailService);
    const confirmAdminCreation = new ConfirmAdminCreation(userRepository, otpRepository, emailService);

    // Instantiate controller
    const controller = new SuperAdminController(initiateAdminCreation, confirmAdminCreation);

    // Global guard: authenticate + superadmin role check
    fastify.addHook('preHandler', async (request, reply) => {
        await authenticate(request, reply);
        if (reply.sent) return; // authenticate already sent 401

        if (request.user?.role !== 'superadmin') {
            return reply.status(403).send({
                success: false,
                message: 'SuperAdmin access required',
            });
        }
    });

    // POST /api/superadmin/admins/initiate
    // Step 1: SuperAdmin provides new admin name + email → OTP is sent to SuperAdmin email
    fastify.post<{ Body: { name: string; email: string } }>(
        '/admins/initiate',
        controller.initiateAdminCreation.bind(controller)
    );

    // POST /api/superadmin/admins/confirm
    // Step 2: SuperAdmin submits OTP → Admin account is created
    fastify.post<{ Body: { otp: string } }>(
        '/admins/confirm',
        controller.confirmAdminCreation.bind(controller)
    );

    // GET /api/superadmin/admins
    // Optional: List all admins (role = 'admin')
    fastify.get('/admins', async (request, reply) => {
        try {
            const payload = await userRepository.findAll({ role: 'admin', limit: 0 });
            return reply.send({
                success: true,
                data: { admins: payload.users.map(a => a.toObject()) },
            });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
};

export default superAdminRoutes;
