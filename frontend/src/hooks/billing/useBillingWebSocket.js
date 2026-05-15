import { useState, useEffect, useCallback, useRef } from 'react';
import { getAccessToken, getTenantId } from '../../services/accounts/storage/secureStorage';

export const useBillingWebSocket = (options = {}) => {
    const {
        autoConnect = true,
        onPaymentSuccess = null,
        onPaymentFailed = null,
        onSubscriptionUpdate = null,
        onInvoiceReady = null,
        onTrialEnding = null,
        reconnectInterval = 3000,
        maxReconnectAttempts = 10,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);
    
    const wsRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);
    const tenantIdRef = useRef(null);

    // Get WebSocket URL
    const getWebSocketUrl = useCallback(async () => {
        const token = await getAccessToken();
        const tenantId = await getTenantId();
        tenantIdRef.current = tenantId;
        
        const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
        return `${wsBaseUrl}/billing/${tenantId}/?token=${token}`;
    }, []);

    // Connect WebSocket
    const connect = useCallback(async () => {
        if (isConnected || isConnecting) return;
        
        setIsConnecting(true);
        setError(null);
        
        try {
            const wsUrl = await getWebSocketUrl();
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                console.log('[BillingWebSocket] Connected');
                setIsConnected(true);
                setIsConnecting(false);
                reconnectAttemptsRef.current = 0;
                
                // Send ping to keep connection alive
                const pingInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    } else {
                        clearInterval(pingInterval);
                    }
                }, 30000);
                
                ws.pingInterval = pingInterval;
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                    
                    // Handle different message types
                    switch (data.type) {
                        case 'payment_success':
                            if (onPaymentSuccess) onPaymentSuccess(data.data);
                            break;
                        case 'payment_failed':
                            if (onPaymentFailed) onPaymentFailed(data.data);
                            break;
                        case 'subscription_updated':
                            if (onSubscriptionUpdate) onSubscriptionUpdate(data.data);
                            break;
                        case 'invoice_ready':
                            if (onInvoiceReady) onInvoiceReady(data.data);
                            break;
                        case 'trial_ending':
                            if (onTrialEnding) onTrialEnding(data.data);
                            break;
                        default:
                            console.log('[BillingWebSocket] Unknown message type:', data.type);
                    }
                } catch (err) {
                    console.error('[BillingWebSocket] Error parsing message:', err);
                }
            };
            
            ws.onerror = (error) => {
                console.error('[BillingWebSocket] Error:', error);
                setError('WebSocket connection error');
            };
            
            ws.onclose = () => {
                console.log('[BillingWebSocket] Disconnected');
                setIsConnected(false);
                setIsConnecting(false);
                
                if (ws.pingInterval) {
                    clearInterval(ws.pingInterval);
                }
                
                // Attempt to reconnect
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, reconnectInterval);
                }
            };
            
            wsRef.current = ws;
        } catch (err) {
            console.error('[BillingWebSocket] Connection error:', err);
            setError(err.message);
            setIsConnecting(false);
        }
    }, [getWebSocketUrl, isConnected, isConnecting, maxReconnectAttempts, reconnectInterval, onPaymentSuccess, onPaymentFailed, onSubscriptionUpdate, onInvoiceReady, onTrialEnding]);

    // Disconnect WebSocket
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        
        setIsConnected(false);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
    }, []);

    // Send message
    const sendMessage = useCallback((type, data = {}) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, ...data }));
            return true;
        }
        return false;
    }, []);

    // Request subscription status
    const requestSubscriptionStatus = useCallback(() => {
        return sendMessage('get_subscription_status');
    }, [sendMessage]);

    // Request recent transactions
    const requestRecentTransactions = useCallback((limit = 10) => {
        return sendMessage('get_recent_transactions', { limit });
    }, [sendMessage]);

    // Request invoice status
    const requestInvoiceStatus = useCallback((invoiceId) => {
        return sendMessage('get_invoice_status', { invoice_id: invoiceId });
    }, [sendMessage]);

    // Auto-connect on mount
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
        isConnecting,
        lastMessage,
        error,
        connect,
        disconnect,
        sendMessage,
        requestSubscriptionStatus,
        requestRecentTransactions,
        requestInvoiceStatus,
    };
};

export default useBillingWebSocket;