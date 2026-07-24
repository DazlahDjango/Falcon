// ============================================
// frontend/src/hooks/reports/useReportWebSocket.js
// ============================================

import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    connectWebSocket,
    disconnectWebSocket,
    getWebSocketStatus,
    isWebSocketConnected,
    sendWebSocketMessage,
} from '../../store/reports/middleware/reportWebSocket.middleware';

export const useReportWebSocket = (channel, options = {}) => {
    const {
        autoConnect = true,
        params = {},
        onMessage = null,
        onConnected = null,
        onDisconnected = null,
        onError = null,
    } = options;

    const dispatch = useDispatch();
    const [status, setStatus] = useState('disconnected');
    const [lastMessage, setLastMessage] = useState(null);
    const wsRef = useRef(null);
    const connectedRef = useRef(false);

    const isConnected = useSelector((state) => {
        const wsStatus = getWebSocketStatus(channel);
        return wsStatus === 'connected';
    });

    const connect = useCallback(() => {
        if (channel) {
            dispatch(connectWebSocket(channel, params));
            wsRef.current = { channel, params };
        }
    }, [dispatch, channel, params]);

    const disconnect = useCallback(() => {
        if (channel) {
            dispatch(disconnectWebSocket(channel));
            wsRef.current = null;
            connectedRef.current = false;
        }
    }, [dispatch, channel]);

    const send = useCallback((data) => {
        if (channel && isWebSocketConnected(channel)) {
            return sendWebSocketMessage(channel, data);
        }
        return false;
    }, [channel]);

    const reconnect = useCallback(() => {
        disconnect();
        setTimeout(() => {
            connect();
        }, 1000);
    }, [disconnect, connect]);

    const handleMessage = useCallback((data) => {
        setLastMessage(data);
        if (onMessage) {
            onMessage(data);
        }
    }, [onMessage]);

    useEffect(() => {
        if (autoConnect && channel) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, channel, connect, disconnect]);

    useEffect(() => {
        if (isConnected && !connectedRef.current) {
            connectedRef.current = true;
            setStatus('connected');
            if (onConnected) {
                onConnected();
            }
        } else if (!isConnected && connectedRef.current) {
            connectedRef.current = false;
            setStatus('disconnected');
            if (onDisconnected) {
                onDisconnected();
            }
        }
    }, [isConnected, onConnected, onDisconnected]);

    useEffect(() => {
        const wsStatus = getWebSocketStatus(channel);
        setStatus(wsStatus);
    }, [channel]);

    return {
        isConnected,
        status,
        connect,
        disconnect,
        reconnect,
        send,
        lastMessage,
        wsRef,
    };
};

export const useDashboardWebSocket = (dashboardId, options = {}) => {
    return useReportWebSocket('dashboard', {
        ...options,
        params: { dashboardId },
    });
};

export const useReportStatusWebSocket = (reportId, options = {}) => {
    return useReportWebSocket('report_status', {
        ...options,
        params: { reportId },
    });
};

export const useReportProgressWebSocket = (reportId, options = {}) => {
    return useReportWebSocket('report_progress', {
        ...options,
        params: { reportId },
    });
};

export const useNotificationsWebSocket = (options = {}) => {
    return useReportWebSocket('notifications', options);
};

export default useReportWebSocket;