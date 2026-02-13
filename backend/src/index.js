import { buildApp } from './app.js';
import config from './config/env.js';

/**
 * Start the server
 */
async function start() {
    try {
        const app = await buildApp();

        await app.listen({
            port: config.port,
            host: config.host,
        });

        app.log.info(`Server listening on ${config.host}:${config.port}`);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

start();
