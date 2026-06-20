// frontend/src/services/tenant/websocket.service.js

import { websocketService } from '../websocket';
import { getAccessToken } from '../accounts/storage/secureStorage';
import { TENANT_WS, websocketBase } from '../../config/constants/websocketApiConstants';

class TenantWebSocketService {
    constructor() {
        this.socket = null;
        this.connectionKey = null;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    async connect(tenantId, eventHandlers = {}) {
        if (!tenantId) {
            console.error('[TenantWebSocket] Tenant ID is required');
            return;
        }

        if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
            console.log('[TenantWebSocket] Already connected');
            return;
        }

        const token = await getAccessToken();
        websocketService.init(websocketBase, token);

        this.listeners = eventHandlers;
        this.connectionKey = `tenant_status_${tenantId}`;

        this.socket = websocketService.connect(
            this.connectionKey,
            TENANT_WS.STATUS(tenantId),
            (data) => this.handleMessage(data),
            () => {
                this.reconnectAttempts = 0;
                if (this.listeners.onOpen) this.listeners.onOpen();
            },
            (error) => {
                console.error('[TenantWebSocket] Error:', error);
                if (this.listeners.onError) this.listeners.onError(error);
            },
            () => {
                if (this.listeners.onClose) this.listeners.onClose();
                this._scheduleReconnect(tenantId, eventHandlers);
            },
            { shouldReconnect: false }
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
            case 'audit_log_created':
                if (this.listeners.onAuditLogCreated) this.listeners.onAuditLogCreated(data);
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
            case 'backup_progress':
                if (this.listeners.onBackupProgress) this.listeners.onBackupProgress(data);
                break;
            case 'backup_complete':
                if (this.listeners.onBackupComplete) this.listeners.onBackupComplete(data);
                break;
            case 'backup_failed':
                if (this.listeners.onBackupFailed) this.listeners.onBackupFailed(data);
                break;
            default:
                if (this.listeners.onMessage) this.listeners.onMessage(data);
        }
    }

    _scheduleReconnect(tenantId, eventHandlers) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts += 1;
            setTimeout(() => {
                console.log(`[TenantWebSocket] Reconnecting... Attempt ${this.reconnectAttempts}`);
                this.connect(tenantId, eventHandlers);
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    send(data) {
        if (this.connectionKey) {
            return websocketService.send(this.connectionKey, data);
        }
        console.warn('[TenantWebSocket] Cannot send message: no active connection');
        return false;
    }

    disconnect() {
        if (this.connectionKey) {
            websocketService.disconnect(this.connectionKey);
        }
        this.socket = null;
        this.connectionKey = null;
    }

    async subscribeToProvisioning(taskId, onProgress, onComplete, onFailed) {
        const token = await getAccessToken();
        websocketService.init(websocketBase, token);
        const key = `tenant_provisioning_${taskId}`;
        const ws = websocketService.connect(
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

        return ws;
    }

    async subscribeToBackupProgress(backupId, onProgress, onComplete, onFailed) {
        const token = await getAccessToken();
        websocketService.init(websocketBase, token);
        const key = `tenant_backup_${backupId}`;
        const ws = websocketService.connect(
            key,
            TENANT_WS.BACKUP_PROGRESS(backupId),
            (data) => {
                switch (data.type) {
                    case 'backup_progress':
                        onProgress?.(data);
                        break;
                    case 'backup_complete':
                        onComplete?.(data);
                        websocketService.disconnect(key);
                        break;
                    case 'backup_failed':
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

        return ws;
    }
}

export default new TenantWebSocketService();