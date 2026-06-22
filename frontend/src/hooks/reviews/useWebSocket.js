// src/hooks/reviews/useWebSocket.js
// Hook for WebSocket connection for real-time updates

import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../../services/websocket';

export const useWebSocket = (url, options = {}) => {
    const {
        onMessage,
        onOpen,
        onClose,
        onError,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        autoConnect = true,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const wsKeyRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(async () => {
        const key = options.key || url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 64);
        wsKeyRef.current = key;

        try {
            await websocketService.connect(
                key,
                url,
                (data) => {
                    setLastMessage(data);
                    if (onMessage) onMessage(data);
                },
                () => {
                    setIsConnected(true);
                    setReconnectAttempts(0);
                    if (onOpen) onOpen();
                },
                (err) => {
                    if (onError) onError(err);
                },
                (event) => {
                    setIsConnected(false);
                    if (onClose) onClose();
                    // websocketService will handle reconnection if enabled
                },
                { shouldReconnect: options.shouldReconnect !== false }
            );
        } catch (err) {
            console.error('WebSocket connection error:', err);
        }
    }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts, options.key, options.shouldReconnect]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsKeyRef.current) {
            websocketService.disconnect(wsKeyRef.current);
            wsKeyRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((data) => websocketService.send(wsKeyRef.current, data), []);

    const sendPing = useCallback(() => {
        return sendMessage({ type: 'ping' });
    }, [sendMessage]);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        reconnectAttempts,
        sendMessage,
        sendPing,
        connect,
        disconnect,
    };
};