import { BlogPost } from './BlogPost.js';

export interface BlogPostFilters {
    userId?: string;
    platform?: string;
}

export interface IBlogPostRepository {
    /**
     * Save (insert or update) a blog post document.
     */
    save(post: BlogPost): Promise<BlogPost>;

    /**
     * Find a blog post by its ID.
     */
    findById(id: string): Promise<BlogPost | null>;

    /**
     * Find all blog posts for a specific user.
     */
    findByUserId(userId: string): Promise<BlogPost[]>;

    /**
     * Find all blog posts with optional filters.
     */
    findAll(filters?: BlogPostFilters): Promise<BlogPost[]>;

    /**
     * Delete a blog post by ID.
     */
    delete(id: string): Promise<void>;
}
