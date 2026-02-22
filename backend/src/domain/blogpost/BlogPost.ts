import { ObjectId } from 'mongodb';

export type BlogPlatform = 'linkedin' | 'x' | 'devto' | 'medium' | 'hashnode' | 'other';

export interface AdminScore {
    adminId: string;
    adminName: string;
    score: number;
    scoredAt: Date;
}

export interface BlogPostProps {
    id?: string;
    userId: string;
    aceId?: string;
    title: string;
    link: string;
    platform: BlogPlatform;
    submittedAt?: Date;
    scores?: AdminScore[];
}

export interface BlogPostDTO {
    id: string;
    userId: string;
    aceId: string;
    title: string;
    link: string;
    platform: BlogPlatform;
    submittedAt: Date;
    scores: AdminScore[];
    averageScore: number;
}

const VALID_PLATFORMS: BlogPlatform[] = ['linkedin', 'x', 'devto', 'medium', 'hashnode', 'other'];

export class BlogPost {
    public readonly id: string;
    public readonly userId: string;
    public readonly aceId: string;
    public readonly title: string;
    public readonly link: string;
    public readonly platform: BlogPlatform;
    public readonly submittedAt: Date;
    public readonly scores: AdminScore[];

    constructor(props: BlogPostProps) {
        this.id = props.id || new ObjectId().toString();
        this.userId = props.userId;
        this.aceId = props.aceId || '';
        this.title = props.title;
        this.link = props.link;
        this.platform = props.platform;
        this.submittedAt = props.submittedAt || new Date();
        this.scores = props.scores || [];

        this.validate();
    }

    get averageScore(): number {
        if (this.scores.length === 0) return 0;
        const total = this.scores.reduce((sum, s) => sum + s.score, 0);
        return parseFloat((total / this.scores.length).toFixed(2));
    }

    private validate(): void {
        if (!this.userId) throw new Error('userId is required');
        if (!this.title || this.title.trim().length === 0) throw new Error('title is required');
        if (!this.link || !this.link.startsWith('http')) throw new Error('Valid post URL is required');
        if (!VALID_PLATFORMS.includes(this.platform)) throw new Error('Invalid platform');
    }

    public toObject(): BlogPostDTO {
        return {
            id: this.id,
            userId: this.userId,
            aceId: this.aceId,
            title: this.title,
            link: this.link,
            platform: this.platform,
            submittedAt: this.submittedAt,
            scores: this.scores,
            averageScore: this.averageScore,
        };
    }
}
