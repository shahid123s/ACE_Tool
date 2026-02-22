export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface Worklog {
    id: string;
    userId: string;
    date: string;          // ISO date string, normalized to midnight UTC
    tasks: string[];       // Each item = one task completed that day
    hoursWorked: number;
    status: 'draft' | 'submitted';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    aceId?: string;
    phone?: string;
    batch?: string;
    domain?: string;
    tier?: string;
    stage?: 'Placement' | 'Boarding week' | 'TOI' | 'Project' | '2 FD' | '1 FD' | 'Placed';
    status: 'ongoing' | 'removed' | 'break' | 'hold' | 'placed';
}

export interface AuthResponseData {
    accessToken: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface Report {
    id: string;
    userId: string;
    type: 'weekly' | 'monthly';
    period: string;
    driveLink: string;
    createdAt: string;
}

export interface EnrichedReport extends Report {
    userName?: string;
    aceId?: string;
    batch?: string;
}

export type BlogPlatform = 'linkedin' | 'x' | 'devto' | 'medium' | 'hashnode' | 'other';

export interface AdminScore {
    adminId: string;
    adminName: string;
    score: number;
    scoredAt: string;
}

export interface BlogPost {
    id: string;
    userId: string;
    aceId: string;
    title: string;
    link: string;
    platform: BlogPlatform;
    submittedAt: string;
    scores: AdminScore[];
    averageScore: number;
}

export interface EnrichedBlogPost extends BlogPost {
    userName: string;
}

