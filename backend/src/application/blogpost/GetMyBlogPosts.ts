import { BlogPostDTO } from '../../domain/blogpost/BlogPost.js';
import { IBlogPostRepository } from '../../domain/blogpost/IBlogPostRepository.js';
import { IUseCase } from '../interfaces.js';

export interface GetMyBlogPostsRequest {
    userId: string;
}

export class GetMyBlogPosts implements IUseCase<GetMyBlogPostsRequest, BlogPostDTO[]> {
    constructor(private readonly repository: IBlogPostRepository) { }

    async execute({ userId }: GetMyBlogPostsRequest): Promise<BlogPostDTO[]> {
        const posts = await this.repository.findByUserId(userId);
        return posts.map((p) => p.toObject());
    }
}
