import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../../../services/websocket';
import * as authService from '../../../services/accounts/storage/secureStorage';
import environment from '../../../config/environment';

function wsBaseUrl() {
    const raw = environment.WS_URL || 'ws://localhost:8000/ws';
    return raw.replace(/\/ws\/?$/, '');
}

const useWebSocket = (endpoint, onMessage, options = {}) => {
    const { autoConnect = true, reconnectOnClose = true } = options;
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const connectionKey = useRef(null);
    const ws = useRef(null);
    const getConnectionKey = useCallback(() => {
        const token = authService.getAccessToken();
        return `${endpoint}_${token?.substring(0, 8)}`;
    }, [endpoint]);
    const connect = useCallback(async () => {
        const key = getConnectionKey();
        connectionKey.current = key;
        const token = await authService.getAccessToken();
        if (token) {
            websocketService.init(wsBaseUrl(), token);
        }
        ws.current = websocketService.connect(
            key,
            endpoint,
            (data) => {
                setLastMessage(data);
                if (onMessage) onMessage(data);
            },
            () => setIsConnected(true),
            () => setIsConnected(false)
        );
    }, [endpoint, onMessage, getConnectionKey]);
    const disconnect = useCallback(() => {
        if (connectionKey.current) {
            websocketService.disconnect(connectionKey.current);
            setIsConnected(false);
            ws.current = null;
        }
    }, []);
    const sendMessage = useCallback((message) => {
        if (connectionKey.current) {
            return websocketService.send(connectionKey.current, message);
        }
        return false;
    }, []);
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
        connect,
        disconnect,
        sendMessage
    };
};
export default useWebSocket;