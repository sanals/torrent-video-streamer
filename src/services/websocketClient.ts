/**
 * WebSocket Client for Real-time Updates
 */
import { WS_URL } from '@/config';

type MessageHandler = (data: any) => void;

class WebSocketClient {
    private ws: WebSocket | null = null;
    private handlers: Map<string, MessageHandler[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;
    private isIntentionallyClosed = false;

    /**
     * Connect to WebSocket server
     */
    connect(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        this.isIntentionallyClosed = false;
        console.log('🔌 Connecting to WebSocket:', WS_URL);

        try {
            this.ws = new WebSocket(WS_URL);

            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.ws = null;

                // Auto-reconnect if not intentionally closed
                if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    setTimeout(() => this.connect(), this.reconnectDelay);
                }
            };
        } catch (error) {
            console.error('❌ Failed to create WebSocket:', error);
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        this.isIntentionallyClosed = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    /**
     * Subscribe to a message type
     */
    on(type: string, handler: MessageHandler): void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type)!.push(handler);
    }

    /**
     * Unsubscribe from a message type
     */
    off(type: string, handler: MessageHandler): void {
        const handlers = this.handlers.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Send message to server
     */
    send(message: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, cannot send message');
        }
    }

    /**
     * Handle incoming message
     */
    private handleMessage(message: any): void {
        const { type, data } = message;

        const handlers = this.handlers.get(type);
        if (handlers) {
            handlers.forEach((handler) => handler(data));
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

// Export singleton instance
export const websocketClient = new WebSocketClient();
