// src/hooks/reviews/useNotification.js
// Hook for real-time notifications

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export const useNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotification, setLatestNotification] = useState(null);

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/reviews/notifications/`;

    const handleMessage = useCallback((data) => {
        if (data.type === 'notification') {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
            setLatestNotification(data);
            
            // Show browser notification if supported
            if (Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.message,
                    icon: '/favicon.ico',
                });
            }
        } else if (data.type === 'unread_count') {
            setUnreadCount(data.count);
        } else if (data.type === 'notifications_list') {
            setNotifications(data.notifications);
        }
    }, []);

    const { isConnected, sendMessage } = useWebSocket(wsUrl, {
        onMessage: handleMessage,
        autoConnect: true,
    });

    // Request notification permission
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((notificationId) => {
        sendMessage({
            type: 'mark_read',
            notification_id: notificationId,
        });
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, [sendMessage]);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        sendMessage({ type: 'mark_all_read' });
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }, [sendMessage]);

    // Get unread count
    const getUnreadCount = useCallback(() => {
        sendMessage({ type: 'get_unread_count' });
    }, [sendMessage]);

    // Get notifications
    const getNotifications = useCallback((limit = 20) => {
        sendMessage({ type: 'get_notifications', limit });
    }, [sendMessage]);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    useEffect(() => {
        requestNotificationPermission();
    }, [requestNotificationPermission]);

    return {
        notifications,
        unreadCount,
        latestNotification,
        isConnected,
        markAsRead,
        markAllAsRead,
        getUnreadCount,
        getNotifications,
        clearNotifications,
    };
};