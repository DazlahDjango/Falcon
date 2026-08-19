import environment from '../../config/environment';

class WebSocketService {
    constructor() {
        this.connections = new Map();
        this.reconnectAttempts = new Map();
        this.reconnectTimers = new Map();
        this.failedConnections = new Set();
        this.reconnectDelay = 3000;
        this.maxReconnectAttempts = 2;
        this.listeners = new Map();
        this.pingTimers = new Map();
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

        if (this.failedConnections.has(key)) {
            return null;
        }

        const wsUrl = this.getWebSocketUrl(endpoint);
        let ws;
        try {
            ws = new WebSocket(wsUrl);
        } catch (err) {
            this.failedConnections.add(key);
            return null;
        }

        ws.key = key;
        ws.isManualClose = false;
        const shouldReconnect = options.shouldReconnect !== false;

        ws.onopen = () => {
            console.log(`[WebSocket] Connected: ${key}`);
            this.reconnectAttempts.delete(key);
            this.failedConnections.delete(key);
            if (onOpen) onOpen(ws);
            this.startHeartbeat(key);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'pong') return;
                if (onMessage) onMessage(data);
                const listeners = this.listeners.get(key) || [];
                listeners.forEach(listener => listener(data));
            } catch (error) {
                console.error(`[WebSocket] Parse error (${key}):`, error);
            }
        };

        ws.onerror = (error) => {
            if (onError) onError(error);
        };

        ws.onclose = (event) => {
            this.stopHeartbeat(key);
            this.connections.delete(key);
            if (onClose) onClose(event);

            if (shouldReconnect && !ws.isManualClose) {
                this.reconnect(key, endpoint, onMessage, onOpen, onError, onClose);
            }
        };

        this.connections.set(key, ws);
        return ws;
    }

    startHeartbeat(key) {
        this.stopHeartbeat(key);
        const timer = setInterval(() => {
            const ws = this.connections.get(key);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
        this.pingTimers.set(key, timer);
    }

    stopHeartbeat(key) {
        if (this.pingTimers.has(key)) {
            clearInterval(this.pingTimers.get(key));
            this.pingTimers.delete(key);
        }
    }

    reconnect(key, endpoint, onMessage, onOpen, onError, onClose) {
        if (this.reconnectTimers.has(key)) {
            clearTimeout(this.reconnectTimers.get(key));
            this.reconnectTimers.delete(key);
        }

        const attempts = (this.reconnectAttempts.get(key) || 0) + 1;
        this.reconnectAttempts.set(key, attempts);

        if (attempts <= this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, attempts - 1);

            const timer = setTimeout(() => {
                this.reconnectTimers.delete(key);
                this.connect(key, endpoint, onMessage, onOpen, onError, onClose);
            }, delay);
            this.reconnectTimers.set(key, timer);
        } else {
            console.warn(`[WebSocket] Max reconnect attempts reached for ${key}. Socket paused.`);
            this.failedConnections.add(key);
        }
    }

    disconnect(key) {
        this.stopHeartbeat(key);
        if (this.reconnectTimers.has(key)) {
            clearTimeout(this.reconnectTimers.get(key));
            this.reconnectTimers.delete(key);
        }
        const ws = this.connections.get(key);
        if (ws) {
            ws.isManualClose = true;
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            } else if (ws.readyState === WebSocket.CONNECTING) {
                ws.onopen = () => {
                    ws.close();
                };
            }
            this.connections.delete(key);
        }
        this.reconnectAttempts.delete(key);
        this.failedConnections.delete(key);
    }

    disconnectAll() {
        for (const key of Array.from(this.connections.keys())) {
            this.disconnect(key);
        }
    }

    send(key, message) {
        const ws = this.connections.get(key);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(typeof message === 'string' ? message : JSON.stringify(message));
            return true;
        }
        return false;
    }

    isConnected(key) {
        const ws = this.connections.get(key);
        return !!ws && ws.readyState === WebSocket.OPEN;
    }
}

export const websocketService = new WebSocketService();
export default websocketService;