import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AdminController } from '../controllers/AdminController.js';
import { CreateStudent, CreateStudentRequest } from '../../../application/admin/CreateStudent.js';
import { userRepository } from '../../../infrastructure/database/MongoUserRepository.js';
import { emailService } from '../../../infrastructure/email/NodemailerEmailService.js';
import { authenticate } from '../middleware/authenticate.js';

/**
 * Admin routes
 * All routes require authentication + admin role
 */
const adminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Instantiate use cases
    const createStudent = new CreateStudent(userRepository, emailService);

    // Instantiate controller
    const adminController = new AdminController(createStudent, userRepository);

    // Middleware: authenticate + admin check on all routes
    fastify.addHook('preHandler', async (request, reply) => {
        await authenticate(request, reply);
        if (reply.sent) return; // authenticate already sent 401

        if (request.user?.role !== 'admin') {
            return reply.status(403).send({
                success: false,
                message: 'Admin access required',
            });
        }
    });

    // Routes
    fastify.post<{ Body: CreateStudentRequest }>(
        '/students',
        adminController.createStudent.bind(adminController)
    );

    fastify.get(
        '/students',
        adminController.getStudents.bind(adminController)
    );
};

export default adminRoutes;
