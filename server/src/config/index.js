import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Parse CORS_ORIGIN - can be comma-separated list or single origin
const parseCorsOrigin = (origin) => {
    if (!origin) return 'http://localhost:3000';
    if (origin.includes(',')) {
        return origin.split(',').map(o => o.trim());
    }
    return origin;
};

// CORS origin function - allows localhost and Tailscale IPs in development
const getCorsOrigin = () => {
    const envOrigin = process.env.CORS_ORIGIN;
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // In development, use a function to dynamically allow origins
    if (nodeEnv === 'development') {
        return (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) {
                callback(null, true);
                return;
            }
            
            // Allow localhost
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                callback(null, true);
                return;
            }
            
            // Allow Tailscale IPs (100.x.x.x range)
            if (origin.match(/^https?:\/\/100\.\d+\.\d+\.\d+:\d+$/)) {
                callback(null, true);
                return;
            }
            
            // Allow configured origins
            const allowedOrigins = parseCorsOrigin(envOrigin);
            if (Array.isArray(allowedOrigins)) {
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                    return;
                }
            } else if (allowedOrigins === origin) {
                callback(null, true);
                return;
            }
            
            // In development, be permissive - allow all
            callback(null, true);
        };
    }
    
    // Production: use strict CORS from environment
    return parseCorsOrigin(envOrigin) || 'http://localhost:3000';
};

const config = {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    downloadsPath: process.env.DOWNLOADS_PATH || './downloads',
    corsOrigin: getCorsOrigin(),
};

// Validate required config
if (!config.port) {
    throw new Error('PORT is required in environment variables');
}

export default config;
