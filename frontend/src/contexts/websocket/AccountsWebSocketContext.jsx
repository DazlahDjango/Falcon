import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../hooks/accounts/useWebSocket';

const AccountsWebSocketContext = createContext(null);

export const useAccountsWebSocketContext = () => useContext(AccountsWebSocketContext);

export const AccountsWebSocketProvider = ({ children, isAuthenticated }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleMessage = useCallback((data) => {
        if (data.type === 'notification') {
            setNotifications(prev => [data.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        } else if (data.type === 'count') {
            setUnreadCount(data.count);
        }
    }, []);

    const { isConnected, send, on, off } = useWebSocket('notifications', {
        autoConnect: isAuthenticated,
        onMessage: handleMessage
    });

    const markRead = useCallback((notificationId) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        if (isConnected) {
            send({ type: 'mark_read', notification_id: notificationId });
        }
    }, [isConnected, send]);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        if (isConnected) {
            send({ type: 'mark_all_read' });
        }
    }, [isConnected, send]);

    return (
        <AccountsWebSocketContext.Provider value={{
            isConnected,
            notifications,
            unreadCount,
            markRead,
            markAllRead,
            send,
            on,
            off
        }}>
            {children}
        </AccountsWebSocketContext.Provider>
    );
};

export default AccountsWebSocketProvider;
