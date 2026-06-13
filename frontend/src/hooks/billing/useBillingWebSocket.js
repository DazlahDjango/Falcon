/**
 * useBillingWebSocket Hook
 * Manages real-time WebSocket connections for billing updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../accounts/useAuth';
import billingWebSocketService from '../../services/billing/websocket.service';

// Use shared billingWebSocketService which delegates to websocketService

export const useBillingWebSocket = (options = {}) => {
    const {
        autoConnect = true,
        onPaymentSuccess = null,
        onPaymentFailed = null,
        onSubscriptionUpdate = null,
        onInvoiceReady = null,
        onTrialEnding = null,
        reconnectInterval = 5000,
        maxReconnectAttempts = 5,
    } = options;

    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);
    
    const wsRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);
    const pingIntervalRef = useRef(null);
    const isMountedRef = useRef(true);
    const authCheckedRef = useRef(false);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
        
        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.OPEN || 
                wsRef.current.readyState === WebSocket.CONNECTING) {
                wsRef.current.close();
            }
            wsRef.current = null;
        }
    }, []);

    // Connect WebSocket using billingWebSocketService (delegates to websocketService)
    const connect = useCallback(async () => {
        if (isConnecting) return;
        if (!isAuthenticated && !authLoading) {
            console.log('[BillingWebSocket] Not authenticated, skipping connection');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            await billingWebSocketService.connect(
                (data) => {
                    if (!isMountedRef.current) return;
                    if (data.type === 'pong') return;
                    setLastMessage(data);
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
                            break;
                    }
                },
                () => {
                    if (!isMountedRef.current) return;
                    setIsConnected(true);
                    setIsConnecting(false);
                    setError(null);
                    reconnectAttemptsRef.current = 0;
                },
                (err) => {
                    if (!isMountedRef.current) return;
                    console.error('[BillingWebSocket] Error:', err);
                    setError('WebSocket connection error');
                },
                () => {
                    if (!isMountedRef.current) return;
                    setIsConnected(false);
                    setIsConnecting(false);
                }
            );
        } catch (err) {
            console.error('[BillingWebSocket] Connection error:', err);
            setError(err.message);
            setIsConnecting(false);
        }
    }, [isConnecting, isAuthenticated, authLoading, onPaymentSuccess, onPaymentFailed, onSubscriptionUpdate, onInvoiceReady, onTrialEnding]);

    // Disconnect WebSocket
    const disconnect = useCallback(() => {
        billingWebSocketService.disconnect();
        setIsConnected(false);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
    }, []);

    // Send message
    const sendMessage = useCallback((type, data = {}) => billingWebSocketService.send({ type, ...data }), []);

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

    // Auto-connect only after authentication is confirmed
    useEffect(() => {
        isMountedRef.current = true;
        
        // Wait for auth to load and be authenticated
        if (!authLoading && isAuthenticated && autoConnect && !authCheckedRef.current) {
            authCheckedRef.current = true;
            // Small delay to ensure all auth data is ready
            const timeoutId = setTimeout(() => {
                if (isMountedRef.current && isAuthenticated) {
                    connect();
                }
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
        
        // Disconnect when logged out
        if (!isAuthenticated && !authLoading) {
            disconnect();
            authCheckedRef.current = false;
        }
        
        return () => {
            isMountedRef.current = false;
            disconnect();
        };
    }, [isAuthenticated, authLoading, autoConnect, connect, disconnect]);

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