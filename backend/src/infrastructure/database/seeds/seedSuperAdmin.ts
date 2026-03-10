import bcrypt from 'bcryptjs';
import { UserModel } from '../schemas/UserSchema.js';

const SUPERADMIN_EMAIL = 'brototype.studentexcellence@gmail.com';
const SUPERADMIN_PASSWORD = 'Brototype@SET#123';
const SUPERADMIN_NAME = 'Super Admin';

/**
 * Seeds the SuperAdmin user on startup.
 * Skipped if already exists.
 */
export async function seedSuperAdmin(): Promise<void> {
    try {
        const existing = await UserModel.findOne({ email: SUPERADMIN_EMAIL });
        if (existing) {
            console.log('[Seed] SuperAdmin already exists — skipping.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, salt);

        const superAdmin = new UserModel({
            name: SUPERADMIN_NAME,
            email: SUPERADMIN_EMAIL,
            password: hashedPassword,
            role: 'superadmin',
        });

        await superAdmin.save();
        console.log('[Seed] SuperAdmin created successfully.');
    } catch (error) {
        console.error('[Seed] Failed to seed SuperAdmin:', error);
    }
}
