// frontend/src/hooks/tenant/useTenantWebSocket.js
import { useState, useEffect, useCallback, useRef } from 'react';
import TenantWebSocketService from '../../services/tenant/websocket.service';

export const useTenantWebSocket = (tenantId = null, options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [statusEvents, setStatusEvents] = useState([]);
    const [quotaWarnings, setQuotaWarnings] = useState([]);
    const [provisioningProgress, setProvisioningProgress] = useState(null);
    const [backupProgress, setBackupProgress] = useState(null);

    const wsService = useRef(TenantWebSocketService);

    const onStatusChange = useCallback((data) => {
        setStatusEvents(prev => [data, ...prev].slice(0, 50));
        if (options.onStatusChange) options.onStatusChange(data);
    }, [options]);

    const onQuotaWarning = useCallback((data) => {
        setQuotaWarnings(prev => [data, ...prev].slice(0, 20));
        if (options.onQuotaWarning) options.onQuotaWarning(data);
    }, [options]);

    const onProvisioningProgress = useCallback((data) => {
        setProvisioningProgress(data);
        if (options.onProvisioningProgress) options.onProvisioningProgress(data);
    }, [options]);

    const onBackupProgress = useCallback((data) => {
        setBackupProgress(data);
        if (options.onBackupProgress) options.onBackupProgress(data);
    }, [options]);

    const onOpen = useCallback(() => {
        setIsConnected(true);
        if (options.onOpen) options.onOpen();
    }, [options]);

    const onClose = useCallback(() => {
        setIsConnected(false);
        if (options.onClose) options.onClose();
    }, [options]);

    const onError = useCallback((error) => {
        if (options.onError) options.onError(error);
    }, [options]);

    const onMessage = useCallback((data) => {
        setLastMessage(data);
        if (options.onMessage) options.onMessage(data);
    }, [options]);

    const connect = useCallback(() => {
        if (!tenantId) return;

        wsService.current.connect(tenantId, {
            onOpen,
            onClose,
            onError,
            onStatusChange,
            onQuotaWarning,
            onProvisioningProgress,
            onBackupProgress,
            onMessage,
        });
    }, [tenantId, onOpen, onClose, onError, onStatusChange, onQuotaWarning, onProvisioningProgress, onBackupProgress, onMessage]);

    const disconnect = useCallback(() => {
        wsService.current.disconnect();
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((data) => {
        wsService.current.send(data);
    }, []);

    const subscribeToProvisioning = useCallback((taskId, onProgress, onComplete, onFailed) => {
        return wsService.current.subscribeToProvisioning(taskId, onProgress, onComplete, onFailed);
    }, []);

    const subscribeToBackupProgress = useCallback((backupId, onProgress, onComplete, onFailed) => {
        return wsService.current.subscribeToBackupProgress(backupId, onProgress, onComplete, onFailed);
    }, []);

    const clearEvents = useCallback(() => {
        setStatusEvents([]);
        setQuotaWarnings([]);
        setProvisioningProgress(null);
        setBackupProgress(null);
    }, []);

    useEffect(() => {
        if (tenantId) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [tenantId, connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        statusEvents,
        quotaWarnings,
        provisioningProgress,
        backupProgress,
        connect,
        disconnect,
        sendMessage,
        clearEvents,
        subscribeToProvisioning,
        subscribeToBackupProgress,
        hasStatusEvents: statusEvents.length > 0,
        hasQuotaWarnings: quotaWarnings.length > 0,
        isProvisioning: !!provisioningProgress,
        isBackingUp: !!backupProgress,
    };
};