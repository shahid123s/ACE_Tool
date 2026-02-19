import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateStudent, CreateStudentRequest, CreateStudentResponse } from '../../../application/admin/CreateStudent.js';
import { IUserRepository } from '../../../domain/user/UserRepository.js';
import { IEmailService } from '../../../application/interfaces/IEmailService.js';
import { IUseCase } from '../../../application/interfaces.js';

/**
 * Admin Controller
 * Handles admin-only HTTP requests
 */
export class AdminController {
    constructor(
        private readonly createStudentUseCase: IUseCase<CreateStudentRequest, CreateStudentResponse>,
        private readonly userRepository: IUserRepository
    ) { }

    /**
     * Create student handler
     * POST /api/admin/students
     */
    async createStudent(request: FastifyRequest<{ Body: CreateStudentRequest }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const result = await this.createStudentUseCase.execute(request.body);

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

    /**
     * List students handler
     * GET /api/admin/students
     */
    async getStudents(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const students = await this.userRepository.findAll({ role: 'user' });
            const studentDTOs = students.map(s => s.toObject());

            return reply.send({
                success: true,
                data: { students: studentDTOs },
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({
                success: false,
                message: error.message,
            });
        }
    }
}
