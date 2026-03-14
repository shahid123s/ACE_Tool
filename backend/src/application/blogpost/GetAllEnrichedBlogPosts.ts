import { BlogPostDTO } from '../../domain/blogpost/BlogPost.js';
import { IBlogPostRepository, BlogPostFilters } from '../../domain/blogpost/IBlogPostRepository.js';
import { IUserRepository } from '../../domain/user/UserRepository.js';
import { IUseCase } from '../interfaces.js';

export interface EnrichedBlogPostDTO extends BlogPostDTO {
    userName: string;
}

export class GetAllEnrichedBlogPosts implements IUseCase<BlogPostFilters, EnrichedBlogPostDTO[]> {
    constructor(
        private readonly postRepository: IBlogPostRepository,
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(filters: BlogPostFilters): Promise<EnrichedBlogPostDTO[]> {
        const posts = await this.postRepository.findAll(filters);
        if (posts.length === 0) return [];

        const uniqueUserIds = [...new Set(posts.map((p) => p.userId))];
        const allUsersPayload = await this.userRepository.findAll({ limit: 0 });
        const userMap = new Map(
            allUsersPayload.users
                .filter((u) => uniqueUserIds.includes(u.id))
                .map((u) => [u.id, u])
        );

        return posts.map((p) => {
            const user = userMap.get(p.userId);
            return {
                ...p.toObject(),
                userName: user?.name || 'Unknown',
            };
        });
    }
}
