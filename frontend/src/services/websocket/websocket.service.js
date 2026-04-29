class WebSocketService {
    constructor() {
        this.connections = new Map();
        this.reconnectAttempts = new Map();
        this.reconnectDelay = 1000;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
        this.baseUrl = null;
        this.authToken = null;
    }
    init(baseUrl, authToken) {
        this.baseUrl = baseUrl;
        this.authToken = authToken;
    }
    getWebSocketUrl(endpoint) {
        const url = `${this.baseUrl}${endpoint}`;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}token=${this.authToken}`;
    }
    connect(key, endpoint, onMessage, onOpen = null, onError = null) {
        if (this.connections.has(key)) {
            return this.connections.get(key);
        }
        const wsUrl = this.getWebSocketUrl(endpoint);
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            console.log(`WebSocket connected: ${key}`);
            this.reconnectAttempts.delete(key);
            if (onOpen) onOpen(ws);
            this.sendPing(key);
        };
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (onMessage) onMessage(data);
                const listeners = this.listeners.get(key) || [];
                listeners.forEach(listener => listener(data));
            } catch (error) {
                console.error('WebSocket message parse error:', error);
            }
        };
        ws.onerror = (error) => {
            console.error(`WebSocket error: ${key}`, error);
            if (onError) onError(error);
        };
        ws.onclose = () => {
            console.log(`WebSocket closed: ${key}`);
            this.connections.delete(key);
            this.reconnect(key, endpoint, onMessage, onOpen, onError);
        };
        this.connections.set(key, ws);
        return ws;
    }
    sendPing(key) {
        const ws = this.connections.get(key);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
        }
        setTimeout(() => {
            if (this.connections.has(key)) {
                this.sendPing(key);
            }
        }, 30000);
    }
    reconnect(key, endpoint, onMessage, onOpen, onError) {
        const attempts = (this.reconnectAttempts.get(key) || 0) + 1;
        this.reconnectAttempts.set(key, attempts);

        if (attempts <= this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, attempts - 1);
            console.log(`Reconnecting ${key} in ${delay}ms (attempt ${attempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect(key, endpoint, onMessage, onOpen, onError);
            }, delay);
        } else {
            console.error(`Max reconnect attempts reached for ${key}`);
        }
    }
    disconnect(key) {
        const ws = this.connections.get(key);
        if (ws) {
            ws.close();
            this.connections.delete(key);
            this.reconnectAttempts.delete(key);
        }
    }
    send(key, message) {
        const ws = this.connections.get(key);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }
    addListener(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }
    removeListener(key, callback) {
        const listeners = this.listeners.get(key);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    isConnected(key) {
        const ws = this.connections.get(key);
        return ws && ws.readyState === WebSocket.OPEN;
    }
    getReadyState(key) {
        const ws = this.connections.get(key);
        return ws ? ws.readyState : WebSocket.CLOSED;
    }
    disconnectAll() {
        for (const [key, ws] of this.connections) {
            ws.close();
            this.connections.delete(key);
        }
        this.listeners.clear();
    }
}
export default new WebSocketService();