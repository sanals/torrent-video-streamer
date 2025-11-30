import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import config from './config/index.js';
import torrentRoutes from './routes/torrentRoutes.js';
import streamRoutes from './routes/streamRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import websocketServer from './websocket/WebSocketServer.js';

const app = express();

// Middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api', torrentRoutes);
app.use('/api', streamRoutes);
app.use('/api', searchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Torrent Video Streamer Backend',
        version: '1.0.0',
        uptime: process.uptime(),
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Torrent Video Streamer API',
        endpoints: {
            health: '/api/health',
            torrents: '/api/torrents',
            stream: '/api/stream/:infoHash/:fileIndex',
        },
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
websocketServer.initialize(httpServer);

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║  🎬 Torrent Video Streamer Backend                    ║
║                                                       ║
║  🚀 Server: http://localhost:${PORT}                  ║
║  🔌 WebSocket: ws://localhost:${PORT}                 ║
║  🔧 Environment: ${config.nodeEnv}                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    websocketServer.destroy();
    process.exit(0);
});

export default app;
