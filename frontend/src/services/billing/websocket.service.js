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

        return `${websocketBase}${BILLING_WS.TENANT(tenantId)}?token=${encodeURIComponent(token)}`;
    }

    async connect(onMessage, onOpen = null, onError = null, onClose = null, options = { shouldReconnect: true }) {
        const wsUrl = await this.getWebSocketUrl();
        return websocketService.connect(
            this.connectionKey,
            wsUrl,
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
}

export const billingWebSocketService = new BillingWebSocketService();
export default billingWebSocketService;
