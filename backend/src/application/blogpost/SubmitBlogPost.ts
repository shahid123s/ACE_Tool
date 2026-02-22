import { BlogPost, BlogPostDTO, BlogPlatform } from '../../domain/blogpost/BlogPost.js';
import { IBlogPostRepository } from '../../domain/blogpost/IBlogPostRepository.js';
import { IUseCase } from '../interfaces.js';

export interface SubmitBlogPostRequest {
    userId: string;
    aceId?: string;
    title: string;
    link: string;
    platform: BlogPlatform;
}

export class SubmitBlogPost implements IUseCase<SubmitBlogPostRequest, BlogPostDTO> {
    constructor(private readonly repository: IBlogPostRepository) { }

    async execute(request: SubmitBlogPostRequest): Promise<BlogPostDTO> {
        const post = new BlogPost({
            userId: request.userId,
            aceId: request.aceId || '',
            title: request.title,
            link: request.link,
            platform: request.platform,
        });
        const saved = await this.repository.save(post);
        return saved.toObject();
    }
}
