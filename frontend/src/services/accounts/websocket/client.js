import { getAccessToken } from '../storage/secureStorage';
import { handleMessage } from './handlers';
import { websocketBase, ACCOUNT_WS } from '../../../config/constants/websocketApiConstants';
import { websocketService } from '../../websocket';

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.namespace = 'notifications';
        this.listeners = new Map();
        this.messageQueue = [];
    }

    async connect(namespace = 'notifications') {
        this.namespace = namespace;
        const key = `accounts_${namespace}`;

        if (websocketService.isConnected(key)) {
            return;
        }

        const token = await getAccessToken();
        if (!token) {
            throw new Error('No authentication token');
        }

        const namespacePath = ACCOUNT_WS[namespace?.toUpperCase()] || `/ws/${namespace}/`;
        websocketService.init(websocketBase, token);

        this.ws = websocketService.connect(
            key,
            namespacePath,
            (data) => {
                try {
                    handleMessage(data, this.listeners);
                } catch (err) {
                    console.error('[AccountsWS] Message handler error:', err);
                }
            },
            () => {
                console.log(`[AccountsWS] Connected to ${namespace}`);
                this._flushQueue(key);
            },
            (error) => {
                console.error(`[AccountsWS] Error:`, error);
            },
            (event) => {
                console.log(`[AccountsWS] Disconnected (${namespace}): ${event?.code}`);
            },
            { shouldReconnect: true }
        );
    }

    disconnect() {
        const key = `accounts_${this.namespace}`;
        websocketService.disconnect(key);
        this.ws = null;
        this.messageQueue = [];
    }

    send(data) {
        const key = `accounts_${this.namespace}`;
        const sent = websocketService.send(key, data);
        if (!sent) {
            this.messageQueue.push(data);
        }
        return sent;
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

    _flushQueue(key) {
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            websocketService.send(key, msg);
        }
    }

    get isConnected() {
        const key = `accounts_${this.namespace}`;
        return websocketService.isConnected(key);
    }
}

const wsClient = new WebSocketClient();
export const authWsClient = new WebSocketClient();
export default wsClient;