import { WebSocketServer } from 'ws';
import torrentManager from '../torrent/TorrentManager.js';

class WebSocketServerManager {
    constructor() {
        this.wss = null;
        this.clients = new Set();
        this.progressInterval = null;
    }

    /**
     * Initialize WebSocket server
     * @param {http.Server} httpServer 
     */
    initialize(httpServer) {
        this.wss = new WebSocketServer({ server: httpServer });

        this.wss.on('connection', (ws) => {
            console.log('🔌 WebSocket client connected');
            this.clients.add(ws);

            // Send initial data
            this.sendTorrentUpdate(ws);

            // Handle messages from client
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('❌ WebSocket message error:', error.message);
                }
            });

            // Handle disconnect
            ws.on('close', () => {
                console.log('🔌 WebSocket client disconnected');
                this.clients.delete(ws);

                // Stop polling if no clients
                if (this.clients.size === 0) {
                    this.stopProgressPolling();
                }
            });

            // Start polling if first client
            if (this.clients.size === 1) {
                this.startProgressPolling();
            }
        });

        console.log('✅ WebSocket server initialized');
    }

    /**
     * Handle incoming messages
     */
    handleMessage(ws, data) {
        const { type, infoHash } = data;

        switch (type) {
            case 'subscribe':
                // For future: subscribe to specific torrent
                ws.subscribedTo = infoHash;
                break;

            case 'unsubscribe':
                ws.subscribedTo = null;
                break;

            default:
                console.log('Unknown message type:', type);
        }
    }

    /**
     * Start polling torrent progress
     */
    startProgressPolling() {
        if (this.progressInterval) {
            return;
        }

        console.log('📊 Starting progress polling...');
        this.progressInterval = setInterval(() => {
            this.broadcastProgress();
        }, 1000); // Update every second
    }

    /**
     * Stop polling torrent progress
     */
    stopProgressPolling() {
        if (this.progressInterval) {
            console.log('📊 Stopping progress polling...');
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    /**
     * Broadcast progress to all clients
     */
    broadcastProgress() {
        const torrents = torrentManager.getAllTorrents();

        this.clients.forEach((ws) => {
            if (ws.readyState === 1) { // WebSocket.OPEN
                this.sendMessage(ws, {
                    type: 'torrent:progress',
                    data: torrents,
                });
            }
        });
    }

    /**
     * Send torrent update to specific client
     */
    sendTorrentUpdate(ws) {
        const torrents = torrentManager.getAllTorrents();
        this.sendMessage(ws, {
            type: 'torrent:update',
            data: torrents,
        });
    }

    /**
     * Send message to client
     */
    sendMessage(ws, message) {
        try {
            if (ws.readyState === 1) { // WebSocket.OPEN
                ws.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error('❌ Error sending WebSocket message:', error.message);
        }
    }

    /**
     * Broadcast message to all clients
     */
    broadcast(message) {
        this.clients.forEach((ws) => {
            this.sendMessage(ws, message);
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopProgressPolling();
        this.wss?.close();
        this.clients.clear();
    }
}

export default new WebSocketServerManager();
