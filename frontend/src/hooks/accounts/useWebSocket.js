import { useState, useEffect, useCallback, useRef } from 'react';
import wsClient from '../../services/accounts/websocket/client';

export const useWebSocket = (namespace = 'notifications', options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);

    const isConnectedRef = useRef(false);
    const isConnectingRef = useRef(false);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const connect = useCallback(async () => {
        if (isConnectedRef.current || isConnectingRef.current) return;
        isConnectingRef.current = true;
        setIsConnecting(true);
        try {
            await wsClient.connect(namespace);
            isConnectedRef.current = true;
            setIsConnected(true);
            optionsRef.current.onConnect?.();
        } catch (error) {
            optionsRef.current.onError?.(error);
        } finally {
            isConnectingRef.current = false;
            setIsConnecting(false);
        }
    }, [namespace]);

    const disconnect = useCallback(() => {
        wsClient.disconnect();
        isConnectedRef.current = false;
        isConnectingRef.current = false;
        setIsConnected(false);
        setIsConnecting(false);
        optionsRef.current.onDisconnect?.();
    }, []);

    const send = useCallback((data) => {
        if (isConnectedRef.current) {
            wsClient.send(data);
        }
    }, []);

    useEffect(() => {
        const autoConnect = optionsRef.current.autoConnect !== false;
        if (autoConnect) {
            connect();
        }
        
        return () => {
            if (autoConnect) {
                disconnect();
            }
        };
    }, [connect, disconnect]);
    
    useEffect(() => {
        const handleMessage = (data) => {
            setLastMessage(data);
            if (optionsRef.current.onMessage) {
                optionsRef.current.onMessage(data);
            }
        };
        
        wsClient.on('message', handleMessage);
        
        return () => {
            wsClient.off('message', handleMessage);
        };
    }, []);

    return {
        isConnected, 
        isConnecting,
        connect,
        disconnect,
        send,
        lastMessage
    };
};

export default useWebSocket;