import { FastifyReply, FastifyRequest } from 'fastify';
import { SubmitBlogPost, SubmitBlogPostRequest } from '../../../application/blogpost/SubmitBlogPost.js';
import { GetMyBlogPosts } from '../../../application/blogpost/GetMyBlogPosts.js';
import { GetAllEnrichedBlogPosts } from '../../../application/blogpost/GetAllEnrichedBlogPosts.js';
import { ScoreBlogPost } from '../../../application/blogpost/ScoreBlogPost.js';
import { DeleteBlogPost } from '../../../application/blogpost/DeleteBlogPost.js';
import { BlogPostFilters } from '../../../domain/blogpost/IBlogPostRepository.js';

type SubmitBody = Omit<SubmitBlogPostRequest, 'userId' | 'aceId'>;

export class BlogPostController {
    constructor(
        private readonly submitBlogPost: SubmitBlogPost,
        private readonly getMyBlogPosts: GetMyBlogPosts,
        private readonly deleteBlogPost: DeleteBlogPost,
        private readonly getAllEnrichedBlogPosts?: GetAllEnrichedBlogPosts,
        private readonly scoreBlogPost?: ScoreBlogPost,
    ) { }

    // ─── User Handlers ───────────────────────────────────────────────

    async submit(
        request: FastifyRequest<{ Body: SubmitBody }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const aceId = request.user!.aceId || '';
            const result = await this.submitBlogPost.execute({ ...request.body, userId, aceId });
            return reply.status(201).send({ success: true, data: result });
        } catch (error: any) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    }

    async getMine(
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const result = await this.getMyBlogPosts.execute({ userId });
            return reply.send({ success: true, data: result });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    async delete(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        try {
            const userId = request.user!.id;
            const isAdmin = request.user!.role === 'admin';
            await this.deleteBlogPost.execute({ postId: request.params.id, userId, isAdmin });
            return reply.send({ success: true, message: 'Blog post deleted' });
        } catch (error: any) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    }

    // ─── Admin Handlers ──────────────────────────────────────────────

    async adminGetAll(
        request: FastifyRequest<{ Querystring: BlogPostFilters }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        if (!this.getAllEnrichedBlogPosts) {
            return reply.status(501).send({ success: false, message: 'Not configured' });
        }
        try {
            const data = await this.getAllEnrichedBlogPosts.execute(request.query);
            return reply.send({ success: true, data });
        } catch (error: any) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    async adminScore(
        request: FastifyRequest<{ Params: { id: string }; Body: { score: number } }>,
        reply: FastifyReply
    ): Promise<FastifyReply> {
        if (!this.scoreBlogPost) {
            return reply.status(501).send({ success: false, message: 'Not configured' });
        }
        try {
            const adminId = request.user!.id;
            const adminName = request.user!.email; // use email as display name fallback
            const { score } = request.body;
            const data = await this.scoreBlogPost.execute({
                postId: request.params.id,
                adminId,
                adminName,
                score,
            });
            return reply.send({ success: true, data });
        } catch (error: any) {
            return reply.status(400).send({ success: false, message: error.message });
        }
    }
}
