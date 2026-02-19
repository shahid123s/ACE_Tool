export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
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
