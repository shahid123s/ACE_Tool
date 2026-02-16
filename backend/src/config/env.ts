import 'dotenv/config';

export interface Config {
    port: string | number;
    host: string;
    nodeEnv: string;
    database: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
}

const config: Config = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    database: {
        uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/ace',
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
};

export default config;
