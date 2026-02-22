import { AdminScore, BlogPost, BlogPostDTO } from '../../domain/blogpost/BlogPost.js';
import { IBlogPostRepository } from '../../domain/blogpost/IBlogPostRepository.js';
import { IUseCase } from '../interfaces.js';

export interface ScoreBlogPostRequest {
    postId: string;
    adminId: string;
    adminName: string;
    score: number; // 0–10
}

export class ScoreBlogPost implements IUseCase<ScoreBlogPostRequest, BlogPostDTO> {
    constructor(private readonly repository: IBlogPostRepository) { }

    async execute(request: ScoreBlogPostRequest): Promise<BlogPostDTO> {
        const { postId, adminId, adminName, score } = request;

        if (score < 0 || score > 10) {
            throw new Error('Score must be between 0 and 10');
        }

        const existing = await this.repository.findById(postId);
        if (!existing) throw new Error('Blog post not found');

        // Upsert admin score (one score per admin)
        const updatedScores: AdminScore[] = [
            ...existing.scores.filter((s) => s.adminId !== adminId),
            { adminId, adminName, score, scoredAt: new Date() },
        ];

        const updated = new BlogPost({
            id: existing.id,
            userId: existing.userId,
            aceId: existing.aceId,
            title: existing.title,
            link: existing.link,
            platform: existing.platform,
            submittedAt: existing.submittedAt,
            scores: updatedScores,
        });

        const saved = await this.repository.save(updated);
        return saved.toObject();
    }
}
