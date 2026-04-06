import { useState, useEffect, useCallback, useRef } from 'react';
import wsClient from '../../services/accounts/websocket/client';

export const useWebSocket = (namespace = 'notifications', options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const listenersRef = useRef(new Map());   
    const { autoConnect = true, onMessage, onConnect, onDisconnect, onError } = options;
    const connect = useCallback(async () => {
        if (isConnected || isConnecting) return;
        setIsConnecting(true);
        try {
            await wsClient.connect(namespace);
            setIsConnected(true);
            onConnect?.();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            onError?.(error);
        } finally {
            setIsConnecting(false);
        }
    }, [namespace, isConnected, isConnecting, onConnect, onError]);
    const disconnect = useCallback(() => {
        wsClient.disconnect();
        setIsConnected(false);
        onDisconnect?.();
    }, [onDisconnect]);
    const send = useCallback((data) => {
        if (isConnected) {
            wsClient.send(data);
        }
    }, [isConnected]);
    const on = useCallback((event, callback) => {
        if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, []);
        }
        listenersRef.current.get(event).push(callback);
        wsClient.on(event, callback);
    }, []);
    const off = useCallback((event, callback) => {
        if (!listenersRef.current.has(event)) return;
        const callbacks = listenersRef.current.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
        wsClient.off(event, callback);
    }, []);
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        
        return () => {
            if (autoConnect) {
                disconnect();
            }
        };
    }, [autoConnect, connect, disconnect]);
    
    // Handle global messages
    useEffect(() => {
        if (!onMessage) return;
        
        const handleMessage = (data) => {
            setLastMessage(data);
            onMessage(data);
        };
        
        wsClient.on('message', handleMessage);
        
        return () => {
            wsClient.off('message', handleMessage);
        };
    }, [onMessage]);

    return {
        isConnected, 
        isConnecting,
        connect,
        disconnect,
        send,
        on,
        off,
        lastMessage
    };
};