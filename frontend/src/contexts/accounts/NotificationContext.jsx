import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../../hooks/accounts/useWebSocket';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../../services/accounts/api/notifications';
import { useAuthContext } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within NotificationProvider');
    }
    return context;
};
export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuthContext();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const pollingIntervalRef = useRef(null);
    
    function handleWebSocketMessage(data) {
        if (data.type === 'notification') {
            setNotifications(prev => [data.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            if (Notification.permission === 'granted') {
                new Notification(data.notification.title, {
                    body: data.notification.message,
                    icon: '/favicon.ico'
                });
            }
        } else if (data.type === 'count') {
            setUnreadCount(data.count);
        }
    }
    
    const { isConnected, send, on, off } = useWebSocket('notifications', {
        autoConnect: isAuthenticated,
        onMessage: handleWebSocketMessage
    });
    useEffect(() => {
        if (isAuthenticated) {
            // TODO: Enable when notifications API is implemented
            // loadNotifications();
            // startPolling();
        }
        return () => {
            stopPolling();
        };
    }, [isAuthenticated]);
    const loadNotifications = useCallback(async (params = {}) => {
        setIsLoading(true);
        try {
            const response = await getNotifications(params);
            setNotifications(response.data.results);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    const markRead = useCallback(async (notificationId) => {
        try {
            await markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId ? { ...n, read: true} : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev -1));
            if (isConnected) {
                send({ type: 'mark_read', notification_id: notificationId});
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, [isConnected, send]);
    const markAllRead = useCallback(async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => 
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
            if (isConnected) {
                send({ type: 'mark_all_read' });
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }, [isConnected, send]);
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) return;
        pollingIntervalRef.current = setInterval(async () => {
            if (!isConnected) {
                try {
                    const count = await getUnreadCount();
                    setUnreadCount(count);
                } catch (error) {
                    console.error('Failed to poll unread count:', error);
                }
            }
        }, 30000);
    }, [isConnected]);
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);
    const requestNotificationPermission = useCallback(async () => {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    }, []);
    const value = {
        notifications, 
        unreadCount,
        isLoading,
        isConnected,
        loadNotifications,
        markRead,
        markAllRead,
        requestNotificationPermission
    };
    return (
        <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
    );
};