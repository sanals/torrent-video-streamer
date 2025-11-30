import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    downloadsPath: process.env.DOWNLOADS_PATH || './downloads',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Validate required config
if (!config.port) {
    throw new Error('PORT is required in environment variables');
}

export default config;
