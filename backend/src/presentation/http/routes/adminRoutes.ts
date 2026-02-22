import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AdminController } from '../controllers/AdminController.js';
import { WorklogController } from '../controllers/WorklogController.js';
import { CreateStudent, CreateStudentRequest } from '../../../application/admin/CreateStudent.js';
import { CreateWorklog } from '../../../application/worklog/CreateWorklog.js';
import { UpdateWorklog } from '../../../application/worklog/UpdateWorklog.js';
import { SubmitWorklog } from '../../../application/worklog/SubmitWorklog.js';
import { GetMyWorklogs } from '../../../application/worklog/GetMyWorklogs.js';
import { GetTodayWorklog } from '../../../application/worklog/GetTodayWorklog.js';
import { GetAllWorklogs } from '../../../application/worklog/GetAllWorklogs.js';
import { GetEnrichedWorklogs } from '../../../application/worklog/GetEnrichedWorklogs.js';
import { ReportController } from '../controllers/ReportController.js';
import { GetAllEnrichedReports } from '../../../application/report/GetAllEnrichedReports.js';
import { BlogPostController } from '../controllers/BlogPostController.js';
import { GetAllEnrichedBlogPosts } from '../../../application/blogpost/GetAllEnrichedBlogPosts.js';
import { ScoreBlogPost } from '../../../application/blogpost/ScoreBlogPost.js';
import { DeleteBlogPost } from '../../../application/blogpost/DeleteBlogPost.js';
import { SubmitBlogPost } from '../../../application/blogpost/SubmitBlogPost.js';
import { GetMyBlogPosts } from '../../../application/blogpost/GetMyBlogPosts.js';
import { userRepository } from '../../../infrastructure/database/MongoUserRepository.js';
import { worklogRepository } from '../../../infrastructure/database/MongoWorklogRepository.js';
import { reportRepository } from '../../../infrastructure/database/MongoReportRepository.js';
import { blogPostRepository } from '../../../infrastructure/database/MongoBlogPostRepository.js';
import { emailService } from '../../../infrastructure/email/NodemailerEmailService.js';
import { authenticate } from '../middleware/authenticate.js';

/**
 * Admin routes
 * All routes require authentication + admin role
 */
const adminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Instantiate use cases
    const createStudent = new CreateStudent(userRepository, emailService);

    // Worklog use cases (admin uses GetEnrichedWorklogs which joins user info)
    const worklogController = new WorklogController(
        new CreateWorklog(worklogRepository),
        new UpdateWorklog(worklogRepository),
        new SubmitWorklog(worklogRepository),
        new GetMyWorklogs(worklogRepository),
        new GetTodayWorklog(worklogRepository),
        new GetAllWorklogs(worklogRepository),
        new GetEnrichedWorklogs(worklogRepository, userRepository),
    );

    // Report Controller for admin (only needs GetAllEnrichedReports)
    const reportController = new ReportController(
        {} as any, {} as any, {} as any, // submit, getMyReports, delete
        new GetAllEnrichedReports(reportRepository, userRepository)
    );

    // Blog Post Controller for admin
    const blogPostController = new BlogPostController(
        new SubmitBlogPost(blogPostRepository),
        new GetMyBlogPosts(blogPostRepository),
        new DeleteBlogPost(blogPostRepository),
        new GetAllEnrichedBlogPosts(blogPostRepository, userRepository),
        new ScoreBlogPost(blogPostRepository),
    );

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

    fastify.put<{ Params: { id: string }, Body: Partial<CreateStudentRequest> & { status?: string; stage?: string } }>(
        '/students/:id',
        adminController.updateStudent.bind(adminController)
    );

    // ─── Admin Worklog Routes ─────────────────────────────────────────

    // GET /api/admin/worklogs?userId=X&date=Y&from=A&to=B&status=Z
    fastify.get('/worklogs', worklogController.adminGetAll.bind(worklogController));

    // GET /api/admin/worklogs/:userId
    fastify.get('/worklogs/:userId', worklogController.adminGetByUser.bind(worklogController));

    // GET /api/admin/worklogs/:userId/date/:date
    fastify.get('/worklogs/:userId/date/:date', worklogController.adminGetByUserAndDate.bind(worklogController));

    // ─── Admin Report Routes ─────────────────────────────────────────

    // GET /api/admin/reports?type=X&userId=Y
    fastify.get('/reports', reportController.adminGetAll.bind(reportController));

    // ─── Admin Blog Post Routes ──────────────────────────────────────

    // GET /api/admin/blogposts?platform=X&userId=Y
    fastify.get('/blogposts', blogPostController.adminGetAll.bind(blogPostController));

    // POST /api/admin/blogposts/:id/score — admin scores a post
    fastify.post<{ Params: { id: string }, Body: { score: number } }>(
        '/blogposts/:id/score',
        blogPostController.adminScore.bind(blogPostController)
    );

    // DELETE /api/admin/blogposts/:id — admin deletes a post
    fastify.delete(
        '/blogposts/:id',
        blogPostController.delete.bind(blogPostController)
    );
};

export default adminRoutes;
