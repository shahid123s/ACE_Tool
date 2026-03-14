import { User } from './User.js';

export interface UserFilters {
    role?: string;
    search?: string;
    domain?: string;
    stage?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedUsers {
    users: User[];
    total: number;
}

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByAceId(aceId: string): Promise<User | null>;
    findAll(filters?: UserFilters): Promise<PaginatedUsers>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<boolean>;
}

export abstract class UserRepository implements IUserRepository {
    abstract findById(id: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findByAceId(aceId: string): Promise<User | null>;
    abstract findAll(filters?: UserFilters): Promise<PaginatedUsers>;
    abstract save(user: User): Promise<User>;
    abstract delete(id: string): Promise<boolean>;
}
