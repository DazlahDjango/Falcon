import environment from '../../config/environment';

class WebSocketService {
    constructor() {
        this.connections = new Map();
        this.reconnectAttempts = new Map();
        this.reconnectDelay = 1000;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
        this.baseUrl = environment.WS_URL?.replace(/\/ws\/?$/, '') || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
        this.authToken = null;
    }

    init(baseUrl = null, authToken = null) {
        if (baseUrl) {
            this.baseUrl = baseUrl.replace(/\/ws\/?$/, '');
        }
        if (authToken) {
            this.authToken = authToken;
        }
    }

    setAuthToken(token) {
        this.authToken = token;
    }

    getWebSocketUrl(endpoint) {
        if (!endpoint) {
            throw new Error('WebSocket endpoint is required');
        }

        if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
            return endpoint;
        }

        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.baseUrl}${path}`;
        const separator = url.includes('?') ? '&' : '?';
        return this.authToken ? `${url}${separator}token=${encodeURIComponent(this.authToken)}` : url;
    }

    connect(key, endpoint, onMessage, onOpen = null, onError = null, onClose = null, options = { shouldReconnect: true }) {
        const existing = this.connections.get(key);
        if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
            return existing;
        }

        const wsUrl = this.getWebSocketUrl(endpoint);
        const ws = new WebSocket(wsUrl);
        const shouldReconnect = options.shouldReconnect !== false;

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

        ws.onclose = (event) => {
            console.log(`WebSocket closed: ${key}`);
            this.connections.delete(key);
            if (onClose) onClose(event);
            if (shouldReconnect) {
                this.reconnect(key, endpoint, onMessage, onOpen, onError, onClose);
            }
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

    reconnect(key, endpoint, onMessage, onOpen, onError, onClose) {
        const attempts = (this.reconnectAttempts.get(key) || 0) + 1;
        this.reconnectAttempts.set(key, attempts);

        if (attempts <= this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, attempts - 1);
            console.log(`Reconnecting ${key} in ${delay}ms (attempt ${attempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect(key, endpoint, onMessage, onOpen, onError, onClose);
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