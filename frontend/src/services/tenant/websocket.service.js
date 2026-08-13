import { websocketService } from '../websocket';
import { getAccessToken } from '../accounts/storage/secureStorage';
import { TENANT_WS, websocketBase } from '../../config/constants/websocketApiConstants';

class TenantWebSocketService {
    constructor() {
        this.connectionKey = null;
        this.listeners = {};
    }

    async connect(tenantId, eventHandlers = {}) {
        if (!tenantId) {
            console.error('[TenantWS] Tenant ID is required');
            return;
        }

        const key = `tenant_status_${tenantId}`;
        this.connectionKey = key;
        this.listeners = eventHandlers;

        if (websocketService.isConnected(key)) {
            console.log('[TenantWS] Already connected');
            return;
        }

        const token = await getAccessToken();
        websocketService.init(websocketBase, token);

        websocketService.connect(
            key,
            TENANT_WS.STATUS(tenantId),
            (data) => this.handleMessage(data),
            () => {
                console.log(`[TenantWS] Connected: ${tenantId}`);
                if (this.listeners.onOpen) this.listeners.onOpen();
            },
            (error) => {
                console.error('[TenantWS] Error:', error);
                if (this.listeners.onError) this.listeners.onError(error);
            },
            (event) => {
                console.log(`[TenantWS] Closed: ${event?.code}`);
                if (this.listeners.onClose) this.listeners.onClose(event);
            },
            { shouldReconnect: true }
        );
    }

    handleMessage(data) {
        switch (data.type) {
            case 'tenant_status_changed':
                if (this.listeners.onStatusChange) this.listeners.onStatusChange(data.data);
                break;
            case 'quota_warning':
                if (this.listeners.onQuotaWarning) this.listeners.onQuotaWarning(data);
                break;
            case 'provisioning_progress':
                if (this.listeners.onProvisioningProgress) this.listeners.onProvisioningProgress(data);
                break;
            case 'provisioning_complete':
                if (this.listeners.onProvisioningComplete) this.listeners.onProvisioningComplete(data);
                break;
            case 'provisioning_failed':
                if (this.listeners.onProvisioningFailed) this.listeners.onProvisioningFailed(data);
                break;
            default:
                if (this.listeners.onMessage) this.listeners.onMessage(data);
        }
    }

    send(data) {
        if (this.connectionKey) {
            return websocketService.send(this.connectionKey, data);
        }
        return false;
    }

    disconnect() {
        if (this.connectionKey) {
            websocketService.disconnect(this.connectionKey);
            this.connectionKey = null;
        }
    }

    async subscribeToProvisioning(taskId, onProgress, onComplete, onFailed) {
        const token = await getAccessToken();
        websocketService.init(websocketBase, token);
        const key = `tenant_provisioning_${taskId}`;
        return websocketService.connect(
            key,
            TENANT_WS.PROVISIONING(taskId),
            (data) => {
                switch (data.type) {
                    case 'provisioning_progress':
                        onProgress?.(data);
                        break;
                    case 'provisioning_complete':
                        onComplete?.(data);
                        websocketService.disconnect(key);
                        break;
                    case 'provisioning_failed':
                        onFailed?.(data);
                        websocketService.disconnect(key);
                        break;
                    default:
                        break;
                }
            },
            null,
            null,
            () => websocketService.disconnect(key),
            { shouldReconnect: false }
        );
    }

    isConnected() {
        return this.connectionKey ? websocketService.isConnected(this.connectionKey) : false;
    }
}

export default new TenantWebSocketService();