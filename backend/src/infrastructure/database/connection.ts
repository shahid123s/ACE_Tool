import mongoose from 'mongoose';
import config from '../../config/env.js';

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(config.database.uri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
