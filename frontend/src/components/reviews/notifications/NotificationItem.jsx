// src/components/reviews/notifications/NotificationItem.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, Clock, User, Calendar, FileText, Eye } from 'lucide-react';
import { useReviewsNotifications } from '../../../hooks/reviews';

const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();
  const { markAsRead, remove } = useReviewsNotifications();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMarkAsRead = async () => {
    await markAsRead(notification.id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setIsDeleting(true);
      try {
        await remove(notification.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleView = () => {
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'review_submitted':
      case 'review_approved':
      case 'review_completed':
        return <FileText size={18} color="#3b82f6" />;
      case 'cycle_started':
      case 'cycle_progress':
        return <Calendar size={18} color="#8b5cf6" />;
      case 'pip_created':
      case 'pip_updated':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'promotion_approved':
        return <TrendingUp size={18} color="#22c55e" />;
      default:
        return <Bell size={18} color="#6b7280" />;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}>
      <div className="notification-item-icon">
        {getNotificationIcon()}
      </div>
      <div className="notification-item-content">
        <div className="notification-item-header">
          <span className="notification-item-title">{notification.title}</span>
          <span className="notification-item-time">{formatDate(notification.created_at)}</span>
        </div>
        <p className="notification-item-message">{notification.message}</p>
        <div className="notification-item-actions">
          {!notification.is_read && (
            <button className="notification-item-action-btn mark-read" onClick={handleMarkAsRead}>
              <CheckCircle size={14} />
              Mark as Read
            </button>
          )}
          <button className="notification-item-action-btn delete" onClick={handleDelete} disabled={isDeleting}>
            <XCircle size={14} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;