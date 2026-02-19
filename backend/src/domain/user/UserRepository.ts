import { User } from './User.js';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByAceId(aceId: string): Promise<User | null>;
    findAll(filters?: { role?: string }): Promise<User[]>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<boolean>;
}

export abstract class UserRepository implements IUserRepository {
    abstract findById(id: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findByAceId(aceId: string): Promise<User | null>;
    abstract findAll(filters?: { role?: string }): Promise<User[]>;
    abstract save(user: User): Promise<User>;
    abstract delete(id: string): Promise<boolean>;
}
