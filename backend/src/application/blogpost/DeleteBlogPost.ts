import { IBlogPostRepository } from '../../domain/blogpost/IBlogPostRepository.js';
import { IUseCase } from '../interfaces.js';

export interface DeleteBlogPostRequest {
    postId: string;
    userId: string;
    isAdmin: boolean;
}

export class DeleteBlogPost implements IUseCase<DeleteBlogPostRequest, void> {
    constructor(private readonly repository: IBlogPostRepository) { }

    async execute({ postId, userId, isAdmin }: DeleteBlogPostRequest): Promise<void> {
        const post = await this.repository.findById(postId);
        if (!post) throw new Error('Blog post not found');

        if (!isAdmin && post.userId !== userId) {
            throw new Error('Unauthorized: you can only delete your own blog posts');
        }

        await this.repository.delete(postId);
    }
}
