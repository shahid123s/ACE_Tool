import { User, UserProps } from '../../domain/user/User.js';
import { IUserRepository, UserRepository } from '../../domain/user/UserRepository.js';
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
        const userDoc = await UserModel.findOne({ email }).select('+otp +otpExpiresAt').lean<UserDocument>();
        if (!userDoc) return null;
        return this.mapToDomain(userDoc);
    }

    async findByAceId(aceId: string): Promise<User | null> {
        const userDoc = await UserModel.findOne({ aceId }).lean<UserDocument>();
        if (!userDoc) return null;
        return this.mapToDomain(userDoc);
    }

    async findAll(filters?: { role?: string }): Promise<User[]> {
        const query: Record<string, unknown> = {};
        if (filters?.role) {
            query.role = filters.role;
        }
        const userDocs = await UserModel.find(query).sort({ createdAt: -1 }).lean<UserDocument[]>();
        return userDocs.map((doc) => this.mapToDomain(doc));
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
            otp: userDoc.otp,
            otpExpiresAt: userDoc.otpExpiresAt,
            createdAt: userDoc.createdAt
        });
    }
}

export const userRepository = new MongoUserRepository();
