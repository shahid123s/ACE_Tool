import { User, UserProps } from '../../domain/user/User.js';
import { IUserRepository, UserRepository, UserFilters, PaginatedUsers } from '../../domain/user/UserRepository.js';
import { UserModel, UserDocument } from './schemas/UserSchema.js';

export class MongoUserRepository extends UserRepository implements IUserRepository {
    constructor() {
        super();
    }

    async findById(id: string): Promise<User | null> {
        try {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
            const userDoc = await UserModel.findById(id).lean<UserDocument>();
            if (!userDoc) return null;
            return this.mapToDomain(userDoc);
        } catch (error) {
            return null;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ email }).lean<UserDocument>();
        if (!userDoc) return null;
        return this.mapToDomain(userDoc);
    }

    async findByAceId(aceId: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ aceId }).lean<UserDocument>();
        if (!userDoc) return null;
        return this.mapToDomain(userDoc);
    }

    async findAll(filters?: UserFilters): Promise<PaginatedUsers> {
        const query: Record<string, any> = {};

        if (filters?.role && filters.role !== 'all') {
            query.role = filters.role;
        }

        if (filters?.domain && filters.domain !== 'all') {
            query.domain = filters.domain;
        }

        if (filters?.stage && filters.stage !== 'all') {
            query.stage = filters.stage;
        }

        if (filters?.status && filters.status !== 'all') {
            query.status = filters.status;
        }

        if (filters?.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
                { aceId: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const page = filters?.page || 1;
        const limit = filters?.limit !== undefined ? filters.limit : 10;
        const skip = limit > 0 ? (page - 1) * limit : 0;

        const [userDocs, total] = await Promise.all([
            UserModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean<UserDocument[]>(),
            UserModel.countDocuments(query)
        ]);

        return {
            users: userDocs.map((doc) => this.mapToDomain(doc)),
            total
        };
    }

    async save(user: User): Promise<User> {
        const persistenceUser = user.toPersistence();
        const { id, ...userData } = persistenceUser;

        let existingUser = null;
        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            existingUser = await UserModel.findById(id);
        }

        if (!existingUser) {
            existingUser = await UserModel.findOne({ email: userData.email });
        }

        if (existingUser) {
            // Update
            existingUser.set(userData);
            if (userData.password) existingUser.password = userData.password;

            const saved = await existingUser.save();
            return this.mapToDomain(saved.toObject());
        } else {
            // Create
            const newUser = new UserModel(userData);
            const saved = await newUser.save();
            return this.mapToDomain(saved.toObject());
        }
    }

    async delete(id: string): Promise<boolean> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) return false;
        const result = await UserModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }

    private mapToDomain(userDoc: any): User {
        const id = userDoc._id ? userDoc._id.toString() : userDoc.id;

        return new User({
            id: id,
            name: userDoc.name,
            email: userDoc.email,
            password: userDoc.password,
            role: userDoc.role,
            aceId: userDoc.aceId,
            phone: userDoc.phone,
            batch: userDoc.batch,
            domain: userDoc.domain,
            tier: userDoc.tier,
            stage: userDoc.stage,
            status: userDoc.status,
            isTemporaryPassword: userDoc.isTemporaryPassword ?? false,
            createdAt: userDoc.createdAt
        });
    }
}

export const userRepository = new MongoUserRepository();
