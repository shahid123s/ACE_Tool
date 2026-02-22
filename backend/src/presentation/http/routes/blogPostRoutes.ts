import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { BlogPostController } from '../controllers/BlogPostController.js';
import { SubmitBlogPost } from '../../../application/blogpost/SubmitBlogPost.js';
import { GetMyBlogPosts } from '../../../application/blogpost/GetMyBlogPosts.js';
import { DeleteBlogPost } from '../../../application/blogpost/DeleteBlogPost.js';
import { blogPostRepository } from '../../../infrastructure/database/MongoBlogPostRepository.js';
import { authenticate } from '../middleware/authenticate.js';

const blogPostRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    const controller = new BlogPostController(
        new SubmitBlogPost(blogPostRepository),
        new GetMyBlogPosts(blogPostRepository),
        new DeleteBlogPost(blogPostRepository),
    );

    // Auth on all routes
    fastify.addHook('preHandler', authenticate);

    // POST /api/blogposts — submit a new blog post
    fastify.post('/', controller.submit.bind(controller));

    // GET /api/blogposts — get my blog posts
    fastify.get('/', controller.getMine.bind(controller));

    // DELETE /api/blogposts/:id — delete a blog post
    fastify.delete('/:id', controller.delete.bind(controller));
};

export default blogPostRoutes;
