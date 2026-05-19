/**
 * BillingWebSocketContext
 * Manages real-time WebSocket connections for billing updates
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/accounts/useAuth';
import { useBillingWebSocket } from '../../hooks/billing';

const BillingWebSocketContext = createContext(null);

export const useBillingWebSocketContext = () => {
    const context = useContext(BillingWebSocketContext);
    if (!context) {
        throw new Error('useBillingWebSocketContext must be used within BillingWebSocketProvider');
    }
    return context;
};

export const BillingWebSocketProvider = ({ children }) => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [lastEvent, setLastEvent] = useState(null);
    const [eventHistory, setEventHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const eventCallbacks = useRef(new Map());
    const isMountedRef = useRef(true);
    const hasConnectedRef = useRef(false);

    const {
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
    } = useBillingWebSocket({
        autoConnect: false, // We'll control connection manually
        onPaymentSuccess: (data) => {
            // Auto-handle payment success
            console.log('[BillingWebSocket] Payment success:', data);
        },
        onPaymentFailed: (data) => {
            console.log('[BillingWebSocket] Payment failed:', data);
        },
    });

    // Handle incoming messages
    useEffect(() => {
        if (!lastMessage) return;

        const { type, data, timestamp } = lastMessage;
        
        // Store last event
        setLastEvent({ type, data, timestamp: new Date(timestamp || Date.now()) });
        
        // Add to history (keep last 50 events)
        setEventHistory(prev => {
            const newHistory = [{ type, data, timestamp: new Date(timestamp || Date.now()) }, ...prev];
            return newHistory.slice(0, 50);
        });
        
        // Add to notifications for certain events
        const notificationTypes = ['payment_success', 'payment_failed', 'trial_ending', 'subscription_expiring'];
        if (notificationTypes.includes(type)) {
            setNotifications(prev => [
                {
                    id: `${Date.now()}-${Math.random()}`,
                    type,
                    data,
                    timestamp: new Date(timestamp || Date.now()),
                    read: false,
                },
                ...prev,
            ].slice(0, 20));
        }
        
        // Trigger callbacks if registered
        const callbacks = eventCallbacks.current.get(type);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }, [lastMessage]);

    // Register event callback
    const onEvent = useCallback((eventType, callback) => {
        if (!eventCallbacks.current.has(eventType)) {
            eventCallbacks.current.set(eventType, new Set());
        }
        eventCallbacks.current.get(eventType).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = eventCallbacks.current.get(eventType);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    eventCallbacks.current.delete(eventType);
                }
            }
        };
    }, []);

    // Mark notification as read
    const markNotificationRead = useCallback((notificationId) => {
        setNotifications(prev => 
            prev.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    }, []);

    // Mark all notifications as read
    const markAllNotificationsRead = useCallback(() => {
        setNotifications(prev => 
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    // Clear notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Connect only when authenticated and not already connected
    useEffect(() => {
        isMountedRef.current = true;
        
        // Wait for auth to be ready
        if (!authLoading && isAuthenticated && !hasConnectedRef.current && !isConnected && !isConnecting) {
            hasConnectedRef.current = true;
            // Small delay to ensure everything is ready
            const timer = setTimeout(() => {
                if (isMountedRef.current && isAuthenticated) {
                    connect();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
        
        // Disconnect on logout
        if (!isAuthenticated && !authLoading && isConnected) {
            hasConnectedRef.current = false;
            disconnect();
        }
        
        return () => {
            isMountedRef.current = false;
        };
    }, [authLoading, isAuthenticated, isConnected, isConnecting, connect, disconnect]);

    // Reconnect on visibility change (only if authenticated)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated && !isConnected && !isConnecting && hasConnectedRef.current) {
                connect();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [connect, isConnected, isConnecting, isAuthenticated]);

    const value = React.useMemo(() => ({
        isConnected,
        isConnecting,
        error,
        lastEvent,
        eventHistory,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        connect,
        disconnect,
        sendMessage,
        requestSubscriptionStatus,
        requestRecentTransactions,
        requestInvoiceStatus,
        onEvent,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
    }), [
        isConnected,
        isConnecting,
        error,
        lastEvent,
        eventHistory,
        notifications,
        connect,
        disconnect,
        sendMessage,
        requestSubscriptionStatus,
        requestRecentTransactions,
        requestInvoiceStatus,
        onEvent,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
    ]);

    return (
        <BillingWebSocketContext.Provider value={value}>
            {children}
        </BillingWebSocketContext.Provider>
    );
};

export default BillingWebSocketProvider;