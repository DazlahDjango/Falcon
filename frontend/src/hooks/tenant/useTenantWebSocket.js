import { useState, useEffect, useCallback, useRef } from 'react';
import TenantWebSocketService from '../../services/tenant/websocket.service';

export const useTenantWebSocket = (tenantId = null, options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [statusEvents, setStatusEvents] = useState([]);
    const [quotaWarnings, setQuotaWarnings] = useState([]);
    const [provisioningProgress, setProvisioningProgress] = useState(null);

    const wsService = useRef(TenantWebSocketService);
    const isConnectingRef = useRef(false);
    const isConnectedRef = useRef(false);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const connect = useCallback(() => {
        if (!tenantId || isConnectingRef.current || isConnectedRef.current) return;
        isConnectingRef.current = true;

        wsService.current.connect(tenantId, {
            onOpen: () => {
                isConnectedRef.current = true;
                isConnectingRef.current = false;
                setIsConnected(true);
                optionsRef.current.onOpen?.();
            },
            onClose: () => {
                isConnectedRef.current = false;
                isConnectingRef.current = false;
                setIsConnected(false);
                optionsRef.current.onClose?.();
            },
            onError: (error) => {
                isConnectingRef.current = false;
                optionsRef.current.onError?.(error);
            },
            onStatusChange: (data) => {
                setStatusEvents(prev => [data, ...prev].slice(0, 50));
                optionsRef.current.onStatusChange?.(data);
            },
            onQuotaWarning: (data) => {
                setQuotaWarnings(prev => [data, ...prev].slice(0, 20));
                optionsRef.current.onQuotaWarning?.(data);
            },
            onProvisioningProgress: (data) => {
                setProvisioningProgress(data);
                optionsRef.current.onProvisioningProgress?.(data);
            },
            onMessage: (data) => {
                setLastMessage(data);
                optionsRef.current.onMessage?.(data);
            },
        });
    }, [tenantId]);

    const disconnect = useCallback(() => {
        wsService.current.disconnect();
        isConnectedRef.current = false;
        isConnectingRef.current = false;
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((data) => {
        wsService.current.send(data);
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
        connect,
        disconnect,
        sendMessage,
    };
};

export default useTenantWebSocket;