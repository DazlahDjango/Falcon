import { getAccessToken } from '../storage/secureStorage';
import { handleMessage } from './handlers';
import { reconnect } from './reconnection';
import { websocketBase, ACCOUNT_WS } from '../../../config/constants/websocketApiConstants';
import { websocketService } from '../../websocket';

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.url = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.messageQueue = [];
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = null;
    }
    connect(namespace = 'notifications') {
        return new Promise(async (resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }
            if (this.isConnecting) {
                const checkInterval = setInterval(() => {
                    if (this.isConnected) {
                        clearInterval(checkInterval);
                        resolve();
                    } else if (!this.isConnecting) {
                        clearInterval(checkInterval);
                        reject(new Error('Connection failed'));
                    }
                }, 100);
                return;
            }
            this.isConnecting = true;
            try {
                const token = await getAccessToken();
                if (!token) {
                    reject(new Error('No authentication token'));
                    this.isConnecting = false;
                    return;
                }

                const namespacePath = ACCOUNT_WS[namespace?.toUpperCase()] || `/ws/${namespace}/`;
                this.url = `${websocketBase}${namespacePath}`;

                websocketService.init(websocketBase, token);
                const key = `accounts_${namespace}`;

                const ws = websocketService.connect(
                    key,
                    namespacePath,
                    (data) => {
                        try {
                            handleMessage(data, this.listeners);
                        } catch (err) {
                            console.error('WebSocket message handler error:', err);
                        }
                    },
                    () => {
                        console.log(`WebSocket connected to ${namespace}`);
                        this.isConnected = true;
                        this.isConnecting = false;
                        this.reconnectAttempts = 0;
                        this._startHeartbeat();
                        // flush queued messages
                        while (this.messageQueue.length > 0) {
                            const message = this.messageQueue.shift();
                            websocketService.send(key, JSON.parse(message));
                        }
                        resolve();
                    },
                    (error) => {
                        console.error('WebSocket error:', error);
                        this.isConnecting = false;
                        reject(error);
                    },
                    (event) => {
                        console.log(`Websocket disconnected: ${event?.code} - ${event?.reason}`);
                        this.isConnected = false;
                        this.isConnecting = false;
                        this._stopHeartbeat();
                        // Let websocketService handle reconnection when appropriate
                    },
                    { shouldReconnect: true }
                );
                this.ws = ws;
            } catch (error) {
                console.error('Failed to get authentication token:', error);
                this.isConnecting = false;
                reject(error);
            }
        });
    }
    disconnect() {
        this._stopHeartbeat();
        if (this.ws) {
            // The websocketService disconnect will close the underlying socket
            websocketService.disconnect(this.ws?.key || this.url);
        }
        this.ws = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.messageQueue = [];
    }
    send(data) {
        const message = JSON.stringify(data);
        // Try to send via websocketService; if not connected queue it
        const key = this.ws?.key || `accounts_notifications`;
        const sent = websocketService.send(key, data);
        if (!sent) {
            this.messageQueue.push(message);
        }
    }
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }
    _startHeartbeat() {
        this._stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
                this.send({ type: 'ping' });
            }
        }, 30000);
    }
    _stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    _flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.ws.send(message);
        }
    }
}
const wsClient = new WebSocketClient();
/** Dedicated client for /ws/auth/ security events (avoids clobbering notifications socket). */
export const authWsClient = new WebSocketClient();
export default wsClient;