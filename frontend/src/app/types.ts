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
    department?: string;
}

export interface AuthResponseData {
    accessToken: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
