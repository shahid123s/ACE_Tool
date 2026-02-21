import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { WorklogController } from '../controllers/WorklogController.js';
import { CreateWorklog } from '../../../application/worklog/CreateWorklog.js';
import { UpdateWorklog } from '../../../application/worklog/UpdateWorklog.js';
import { SubmitWorklog } from '../../../application/worklog/SubmitWorklog.js';
import { GetMyWorklogs } from '../../../application/worklog/GetMyWorklogs.js';
import { GetTodayWorklog } from '../../../application/worklog/GetTodayWorklog.js';
import { GetAllWorklogs } from '../../../application/worklog/GetAllWorklogs.js';
import { worklogRepository } from '../../../infrastructure/database/MongoWorklogRepository.js';
import { authenticate } from '../middleware/authenticate.js';

/**
 * User Worklog Routes
 * All routes require authentication
 */
const worklogRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Use cases
    const createWorklog = new CreateWorklog(worklogRepository);
    const updateWorklog = new UpdateWorklog(worklogRepository);
    const submitWorklog = new SubmitWorklog(worklogRepository);
    const getMyWorklogs = new GetMyWorklogs(worklogRepository);
    const getTodayWorklog = new GetTodayWorklog(worklogRepository);
    const getAllWorklogs = new GetAllWorklogs(worklogRepository);

    const controller = new WorklogController(
        createWorklog,
        updateWorklog,
        submitWorklog,
        getMyWorklogs,
        getTodayWorklog,
        getAllWorklogs,
    );

    // Authenticate all user worklog routes
    fastify.addHook('preHandler', authenticate);

    // Routes
    fastify.post('/', controller.create.bind(controller));
    fastify.patch('/:id', controller.update.bind(controller));
    fastify.post('/:id/submit', controller.submit.bind(controller));
    fastify.get('/today', controller.getToday.bind(controller));
    fastify.get('/', controller.getMine.bind(controller));
};

export default worklogRoutes;
