import { websocketService } from '../websocket';
import { getAccessToken, getTenantId } from '../accounts/storage/secureStorage';
import { BILLING_WS, websocketBase } from '../../config/constants/websocketApiConstants';

class BillingWebSocketService {
    constructor() {
        this.connectionKey = 'billing_tenant';
    }

    async getWebSocketUrl() {
        const token = await getAccessToken();
        const tenantId = await getTenantId();

        if (!token) {
            throw new Error('Billing WebSocket requires an access token');
        }
        if (!tenantId) {
            throw new Error('Billing WebSocket requires a tenant ID');
        }

        return { token, endpoint: BILLING_WS.TENANT(tenantId) };
    }

    async connect(onMessage, onOpen = null, onError = null, onClose = null, options = { shouldReconnect: true }) {
        const { token, endpoint } = await this.getWebSocketUrl();
        websocketService.init(websocketBase, token);

        return websocketService.connect(
            this.connectionKey,
            endpoint,
            onMessage,
            onOpen,
            onError,
            onClose,
            options
        );
    }

    disconnect() {
        websocketService.disconnect(this.connectionKey);
    }

    send(message) {
        return websocketService.send(this.connectionKey, message);
    }

    isConnected() {
        return websocketService.isConnected(this.connectionKey);
    }
}

export const billingWebSocketService = new BillingWebSocketService();
export default billingWebSocketService;
