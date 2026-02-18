export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    department?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
