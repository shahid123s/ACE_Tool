import { User, UserProps } from '../../domain/user/User.js';
import { IUserRepository, UserRepository } from '../../domain/user/UserRepository.js';
import { UserModel, UserDocument } from './schemas/UserSchema.js';

export class MongoUserRepository extends UserRepository implements IUserRepository {
    constructor() {
        super();
    }

    async findById(id: string): Promise<User | null> {
        try {
            if (!id.match(/^[0-9a-fA-F]{24}$/)) return null; // Only accept valid ObjectIds if schema is default
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

    async save(user: User): Promise<User> {
        const persistenceUser = user.toPersistence();
        const { id, ...userData } = persistenceUser;

        // Check if user exists by email (unique constraint) or id if valid ObjectId
        // Since our domain generates IDs, we might want to prioritize Mongo IDs on save.

        // Strategy:
        // 1. If we have a valid Mongo ObjectId in `id`, we update.
        // 2. If not, we check by email.
        // 3. Else create new.

        let existingUser = null;
        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            existingUser = await UserModel.findById(id);
        }

        if (!existingUser) {
            existingUser = await UserModel.findOne({ email: userData.email });
        }

        if (existingUser) {
            // Update
            existingUser.set(userData); // Update fields
            // Ensure password is set if provided
            if (userData.password) existingUser.password = userData.password;

            const saved = await existingUser.save();
            // Return updated domain entity
            return this.mapToDomain(saved.toObject());
        } else {
            // Create
            // We ignore the domain generated ID and rely on Mongo ID
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
        // userDoc might have _id as ObjectId or string depending on lean/toObject
        // We cast to string for Domain ID
        const id = userDoc._id ? userDoc._id.toString() : userDoc.id;

        return new User({
            id: id,
            name: userDoc.name,
            email: userDoc.email,
            password: userDoc.password,
            role: userDoc.role,
            createdAt: userDoc.createdAt
        });
    }
}

export const userRepository = new MongoUserRepository();
