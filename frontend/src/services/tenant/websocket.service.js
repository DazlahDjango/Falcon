// frontend/src/services/tenant/websocket.service.js

class TenantWebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    /**
     * Connect to tenant status WebSocket
     * @param {string|number} tenantId - Tenant ID
     * @param {Object} eventHandlers - Event handler functions
     */
    connect(tenantId, eventHandlers = {}) {
        const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/tenant/${tenantId}/status/`;
        this.socket = new WebSocket(wsUrl);
        this.listeners = eventHandlers;

        this.socket.onopen = () => {
            console.log(`WebSocket connected for tenant ${tenantId}`);
            this.reconnectAttempts = 0;
            if (this.listeners.onOpen) this.listeners.onOpen();
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (this.listeners.onError) this.listeners.onError(error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            if (this.listeners.onClose) this.listeners.onClose();
            this.reconnect(tenantId, eventHandlers);
        };
    }

    /**
     * Handle incoming WebSocket messages
     * @param {Object} data - Message data
     */
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

    /**
     * Attempt to reconnect WebSocket
     * @param {string|number} tenantId - Tenant ID
     * @param {Object} eventHandlers - Event handlers
     */
    reconnect(tenantId, eventHandlers) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
                this.connect(tenantId, eventHandlers);
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    /**
     * Send message through WebSocket
     * @param {Object} data - Message data
     */
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    /**
     * Subscribe to provisioning progress for a specific task
     * @param {string} taskId - Provisioning task ID
     * @param {Function} onProgress - Progress callback
     * @param {Function} onComplete - Complete callback
     * @param {Function} onFailed - Failed callback
     * @returns {WebSocket} WebSocket instance
     */
    subscribeToProvisioning(taskId, onProgress, onComplete, onFailed) {
        const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/tenant/provisioning/${taskId}/`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'provisioning_progress':
                    if (onProgress) onProgress(data);
                    break;
                case 'provisioning_complete':
                    if (onComplete) onComplete(data);
                    ws.close();
                    break;
                case 'provisioning_failed':
                    if (onFailed) onFailed(data);
                    ws.close();
                    break;
            }
        };

        return ws;
    }

    /**
     * Subscribe to backup progress for a specific backup
     * @param {string} backupId - Backup ID
     * @param {Function} onProgress - Progress callback
     * @param {Function} onComplete - Complete callback
     * @param {Function} onFailed - Failed callback
     * @returns {WebSocket} WebSocket instance
     */
    subscribeToBackupProgress(backupId, onProgress, onComplete, onFailed) {
        const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/tenant/backup/${backupId}/progress/`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'backup_progress':
                    if (onProgress) onProgress(data);
                    break;
                case 'backup_complete':
                    if (onComplete) onComplete(data);
                    ws.close();
                    break;
                case 'backup_failed':
                    if (onFailed) onFailed(data);
                    ws.close();
                    break;
            }
        };

        return ws;
    }
}

export default new TenantWebSocketService();