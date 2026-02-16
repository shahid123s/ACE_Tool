import { User } from './User.js';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<boolean>;
}

// Keep the abstract class if needed for partial implementation, or just use the interface.
// For Clean Architecture in TS, an interface is usually sufficient for the Port.
// However, to minimize refactoring churn in `InMemoryUserRepository`, let's keep it as an abstract class implementing the interface, or just export the interface and fail if someone tries to instantiate the old class (usage of `extends UserRepository` might need check).
// Looking at `InMemoryUserRepository.js`: `export class InMemoryUserRepository extends UserRepository`
// So I should keep `UserRepository` as an abstract class or just an interface and change `InMemoryUserRepository` to implement it.
// Breaking change: `extends` vs `implements`.
// I will keep it as an abstract class to support `extends` but make it abstract.

export abstract class UserRepository implements IUserRepository {
    abstract findById(id: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract save(user: User): Promise<User>;
    abstract delete(id: string): Promise<boolean>;
}

