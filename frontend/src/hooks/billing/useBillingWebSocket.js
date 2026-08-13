import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../accounts/useAuth';
import billingWebSocketService from '../../services/billing/websocket.service';

export const useBillingWebSocket = (options = {}) => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);

    const isMountedRef = useRef(true);
    const isConnectingRef = useRef(false);
    const isConnectedRef = useRef(false);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const connect = useCallback(async () => {
        if (isConnectingRef.current || isConnectedRef.current) return;
        if (!isAuthenticated && !authLoading) return;

        isConnectingRef.current = true;
        setIsConnecting(true);
        setError(null);

        try {
            await billingWebSocketService.connect(
                (data) => {
                    if (!isMountedRef.current) return;
                    if (data.type === 'pong') return;
                    setLastMessage(data);
                    const currentOptions = optionsRef.current;
                    switch (data.type) {
                        case 'payment_success':
                            currentOptions.onPaymentSuccess?.(data.data || data);
                            break;
                        case 'payment_failed':
                            currentOptions.onPaymentFailed?.(data.data || data);
                            break;
                        case 'subscription_updated':
                            currentOptions.onSubscriptionUpdate?.(data.data || data);
                            break;
                        default:
                            break;
                    }
                },
                () => {
                    if (!isMountedRef.current) return;
                    isConnectedRef.current = true;
                    isConnectingRef.current = false;
                    setIsConnected(true);
                    setIsConnecting(false);
                },
                (err) => {
                    if (!isMountedRef.current) return;
                    isConnectingRef.current = false;
                    setError(err);
                    setIsConnecting(false);
                },
                () => {
                    if (!isMountedRef.current) return;
                    isConnectedRef.current = false;
                    isConnectingRef.current = false;
                    setIsConnected(false);
                    setIsConnecting(false);
                }
            );
        } catch (err) {
            if (!isMountedRef.current) return;
            isConnectingRef.current = false;
            setError(err);
            setIsConnecting(false);
        }
    }, [isAuthenticated, authLoading]);

    const disconnect = useCallback(() => {
        billingWebSocketService.disconnect();
        isConnectedRef.current = false;
        isConnectingRef.current = false;
        setIsConnected(false);
        setIsConnecting(false);
    }, []);

    const sendMessage = useCallback((data) => {
        return billingWebSocketService.send(data);
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        const autoConnect = optionsRef.current.autoConnect !== false;
        if (autoConnect && isAuthenticated && !authLoading) {
            connect();
        }
        return () => {
            isMountedRef.current = false;
            disconnect();
        };
    }, [isAuthenticated, authLoading, connect, disconnect]);

    return {
        isConnected,
        isConnecting,
        lastMessage,
        error,
        connect,
        disconnect,
        sendMessage
    };
};

export default useBillingWebSocket;