import { buildApp } from './app.js';
import config from './config/env.js';
import { connectDB } from './infrastructure/database/connection.js';

/**
 * Start the server
 */
async function start(): Promise<void> {
    try {
        await connectDB();
        const app = await buildApp();
        const port = Number(config.port);

        await app.listen({
            port: port,
            host: config.host,
        });

        const address = app.server.address();
        const addressInfo = typeof address === 'string' ? address : `${address?.address}:${address?.port}`;

        app.log.info(`Server listening on ${addressInfo}`);
        console.log(`Server listening on ${addressInfo}`);
        console.log(`Server running on http://localhost:${port}`)
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

start();
