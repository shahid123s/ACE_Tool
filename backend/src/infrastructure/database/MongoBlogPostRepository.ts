import { IBlogPostRepository, BlogPostFilters } from '../../domain/blogpost/IBlogPostRepository.js';
import { BlogPost, AdminScore } from '../../domain/blogpost/BlogPost.js';
import { BlogPostModel } from './schemas/BlogPostSchema.js';

export class MongoBlogPostRepository implements IBlogPostRepository {
    async save(post: BlogPost): Promise<BlogPost> {
        const data = {
            userId: post.userId,
            aceId: post.aceId,
            title: post.title,
            link: post.link,
            platform: post.platform,
            submittedAt: post.submittedAt,
            scores: post.scores,
        };

        const doc = await BlogPostModel.findByIdAndUpdate(
            post.id,
            { $set: data },
            { new: true, upsert: true }
        );

        return this.mapToDomain(doc);
    }

    async findById(id: string): Promise<BlogPost | null> {
        const doc = await BlogPostModel.findById(id);
        if (!doc) return null;
        return this.mapToDomain(doc);
    }

    async findByUserId(userId: string): Promise<BlogPost[]> {
        const docs = await BlogPostModel.find({ userId }).sort({ submittedAt: -1 });
        return docs.map(this.mapToDomain);
    }

    async findAll(filters?: BlogPostFilters): Promise<BlogPost[]> {
        const query: any = {};
        if (filters?.userId) query.userId = filters.userId;
        if (filters?.platform) query.platform = filters.platform;

        const docs = await BlogPostModel.find(query).sort({ submittedAt: -1 });
        return docs.map(this.mapToDomain);
    }

    async delete(id: string): Promise<void> {
        await BlogPostModel.findByIdAndDelete(id);
    }

    private mapToDomain(doc: any): BlogPost {
        const scores: AdminScore[] = (doc.scores || []).map((s: any) => ({
            adminId: s.adminId.toString(),
            adminName: s.adminName,
            score: s.score,
            scoredAt: s.scoredAt,
        }));

        return new BlogPost({
            id: doc._id.toString(),
            userId: doc.userId.toString(),
            aceId: doc.aceId || '',
            title: doc.title,
            link: doc.link,
            platform: doc.platform,
            submittedAt: doc.submittedAt,
            scores,
        });
    }
}

export const blogPostRepository = new MongoBlogPostRepository();
