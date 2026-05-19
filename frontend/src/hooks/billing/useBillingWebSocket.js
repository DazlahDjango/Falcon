/**
 * useBillingWebSocket Hook
 * Manages real-time WebSocket connections for billing updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAccessToken, getTenantId } from '../../services/accounts/storage/secureStorage';
import { useAuth } from '../accounts/useAuth';

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

    // Get WebSocket URL
    const getWebSocketUrl = useCallback(async () => {
        const token = await getAccessToken();
        const tenantId = await getTenantId();
        
        if (!token) {
            throw new Error('No access token available');
        }
        
        if (!tenantId) {
            throw new Error('No tenant ID available');
        }
        
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}`;
        return `${wsHost}/ws/billing/${tenantId}/?token=${encodeURIComponent(token)}`;
    }, []);

    // Connect WebSocket
    const connect = useCallback(async () => {
        // Don't connect if already connected or connecting
        if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
            return;
        }
        
        // Don't connect if not authenticated
        if (!isAuthenticated && !authLoading) {
            console.log('[BillingWebSocket] Not authenticated, skipping connection');
            return;
        }
        
        // Clean up existing connection
        cleanup();
        
        setIsConnecting(true);
        setError(null);
        
        try {
            const wsUrl = await getWebSocketUrl();
            console.log('[BillingWebSocket] Connecting...');
            
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            
            // Connection timeout
            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN && isMountedRef.current) {
                    console.error('[BillingWebSocket] Connection timeout');
                    ws.close();
                    setError('Connection timeout');
                    setIsConnecting(false);
                }
            }, 10000);
            
            ws.onopen = () => {
                if (!isMountedRef.current) return;
                
                clearTimeout(connectionTimeout);
                console.log('[BillingWebSocket] Connected');
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
                reconnectAttemptsRef.current = 0;
                
                // Send ping to keep connection alive
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                }
                
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN && isMountedRef.current) {
                        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                    } else if (pingIntervalRef.current) {
                        clearInterval(pingIntervalRef.current);
                    }
                }, 30000);
            };
            
            ws.onmessage = (event) => {
                if (!isMountedRef.current) return;
                
                try {
                    const data = JSON.parse(event.data);
                    
                    // Skip pong responses
                    if (data.type === 'pong') return;
                    
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
                            // Silent for unknown types
                            break;
                    }
                } catch (err) {
                    console.error('[BillingWebSocket] Error parsing message:', err);
                }
            };
            
            ws.onerror = (event) => {
                if (!isMountedRef.current) return;
                
                console.error('[BillingWebSocket] Error:', event);
                setError('WebSocket connection error');
            };
            
            ws.onclose = (event) => {
                if (!isMountedRef.current) return;
                
                console.log(`[BillingWebSocket] Disconnected: ${event.code}`);
                setIsConnected(false);
                setIsConnecting(false);
                
                // Clear ping interval
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }
                
                // Attempt to reconnect only if authenticated and not intentional close
                if (isAuthenticated && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    
                    console.log(`[BillingWebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
                    
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                    }
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current && isAuthenticated) {
                            reconnectAttemptsRef.current++;
                            connect();
                        }
                    }, delay);
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    console.warn('[BillingWebSocket] Max reconnect attempts reached');
                    setError('Unable to establish WebSocket connection');
                }
            };
        } catch (err) {
            console.error('[BillingWebSocket] Connection error:', err);
            setError(err.message);
            setIsConnecting(false);
        }
    }, [getWebSocketUrl, isConnecting, isAuthenticated, authLoading, cleanup, maxReconnectAttempts, reconnectInterval, onPaymentSuccess, onPaymentFailed, onSubscriptionUpdate, onInvoiceReady, onTrialEnding]);

    // Disconnect WebSocket
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
        
        if (wsRef.current) {
            // Mark as intentional close to prevent reconnection
            wsRef.current.close();
            wsRef.current = null;
        }
        
        setIsConnected(false);
        setIsConnecting(false);
        setError(null);
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