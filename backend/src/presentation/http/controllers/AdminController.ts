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
    /**
     * Update student handler
     * PUT /api/admin/students/:id
     */
    async updateStudent(request: FastifyRequest<{ Params: { id: string }, Body: Partial<CreateStudentRequest> & { status?: string; stage?: string } }>, reply: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = request.params;
            const updateData = request.body;

            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found',
                });
            }

            // Update allowed fields
            if (updateData.name) existingUser.name = updateData.name;
            if (updateData.email) (existingUser as any).email = updateData.email; // Email update might need validation consistency
            if (updateData.phone) (existingUser as any).phone = updateData.phone;
            if (updateData.aceId) (existingUser as any).aceId = updateData.aceId;
            if (updateData.batch) (existingUser as any).batch = updateData.batch;
            if (updateData.domain) (existingUser as any).domain = updateData.domain;
            if (updateData.tier) (existingUser as any).tier = updateData.tier;
            if (updateData.stage) (existingUser as any).stage = updateData.stage;
            if (updateData.status) (existingUser as any).status = updateData.status;

            const updatedUser = await this.userRepository.save(existingUser);

            return reply.send({
                success: true,
                data: updatedUser.toObject(),
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
