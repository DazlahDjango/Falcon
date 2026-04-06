import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { FiBell, FiCheck, FiX, FiChevronRight } from 'react-icons/fi';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../../../store/accounts/slice/notificationSlice';

const NotificationList = ({ limit = 10, showHeader = true }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);
    const [expanded, setExpanded] = useState(false);
    
    useEffect(() => {
        dispatch(fetchNotifications({ limit: limit * 2 }));
    }, [dispatch, limit]);
    
    const getNotificationIcon = (level) => {
        switch (level) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return '📢';
        }
    };
    
    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await dispatch(markAsRead(notification.id));
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };
    
    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
    };
    
    const displayedNotifications = expanded ? notifications : notifications?.slice(0, limit);
    
    return (
        <div className="notification-list">
            {showHeader && (
                <div className="notification-header">
                    <div className="header-left">
                        <FiBell />
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="unread-badge">{unreadCount}</span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button className="mark-all-read" onClick={handleMarkAllRead}>
                            Mark all read
                        </button>
                    )}
                </div>
            )}
            
            <div className="notification-items">
                {isLoading ? (
                    <div className="loading-state">Loading...</div>
                ) : notifications?.length === 0 ? (
                    <div className="empty-state">No notifications</div>
                ) : (
                    displayedNotifications?.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification.level)}
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">{notification.title}</div>
                                <div className="notification-message">{notification.message}</div>
                                <div className="notification-time">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </div>
                            </div>
                            {!notification.read && <div className="unread-dot" />}
                        </div>
                    ))
                )}
            </div>
            
            {notifications?.length > limit && (
                <button 
                    className="expand-btn"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Show less' : `View all (${notifications.length})`}
                    <FiChevronRight className={`expand-icon ${expanded ? 'expanded' : ''}`} />
                </button>
            )}
        </div>
    );
};

export default NotificationList;