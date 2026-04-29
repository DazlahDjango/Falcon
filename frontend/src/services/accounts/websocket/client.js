import { getAccessToken } from '../storage/secureStorage';
import { handleMessage } from './handlers';
import { reconnect } from './reconnection';

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
                // Await the async token retrieval
                const token = await getAccessToken();
                if (!token) {
                    reject(new Error("No authentication token"));
                    this.isConnecting = false;
                    return;
                }
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.host;
                this.url = `${protocol}//${host}/ws/${namespace}/?token=${token}`;
                this.ws = new WebSocket(this.url);
                this.ws.onopen = () => {
                    console.log(`WebSocket connected to ${namespace}`);
                    this.isConnected = true;
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    this._startHeartbeat();
                    this._flushMessageQueue();
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        handleMessage(data, this.listeners);
                    } catch (error) {
                        console.error('WebSocket message parse error:', error);
                    }
                };
                this.ws.onclose = (event) => {
                    console.log(`Websocket disconnected: ${event.code} - ${event.reason}`);
                    this.isConnected = false;
                    this.isConnecting = false;
                    this._stopHeartbeat();
                    if (event.code !== 1000) {
                        reconnect(this);
                    }
                };
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.isConnecting = false;
                    reject(error);
                };
            } catch (error) {
                console.error('Failed to get authentication token:', error);
                this.isConnecting = false;
                reject(error);
            }
        });
    }
    disconnect() {
        this._stopHeartbeat();
        if (this.ws && this.isConnected) {
            this.ws.close(1000, 'Normal closure');
        }
        this.ws = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.messageQueue = [];
    }
    send(data) {
        const message = JSON.stringify(data);
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
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
        this.heatbeatInterval = setInterval(() => {
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
        this.on('pong', () => {
            console.debug('Heartbeat recieved');
        });
    }
    _flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.ws.send(message);
        }
    }
}
const wsClient = new WebSocketClient();
export default wsClient;