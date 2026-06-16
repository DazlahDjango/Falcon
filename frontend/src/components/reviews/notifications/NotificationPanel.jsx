// src/components/reviews/notifications/NotificationPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck, ChevronRight } from 'lucide-react';
import { useReviewsNotifications } from '../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import NotificationItem from './NotificationItem';

const NotificationPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { data, loading, fetchAll, markAllAsRead, unreadCount, canManage } = useReviewsNotifications();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    if (isOpen && canManage) {
      fetchAll({ page: 1, page_size: 10 });
    }
  }, [isOpen, canManage, fetchAll]);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
      fetchAll({ page: 1, page_size: 10 });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/reviews/notifications');
  };

  if (!canManage) return null;

  return (
    <div className={`notification-panel ${isOpen ? 'open' : ''}`}>
      <div className="notification-panel-header">
        <div className="notification-panel-title">
          <Bell size={18} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="notification-panel-unread">{unreadCount}</span>
          )}
        </div>
        <div className="notification-panel-actions">
          {unreadCount > 0 && (
            <button
              className="notification-panel-mark-all"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
            >
              <CheckCheck size={16} />
              {isMarkingAll ? '...' : 'Mark all read'}
            </button>
          )}
          <button className="notification-panel-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="notification-panel-body">
        {loading ? (
          <ReviewLoading size="sm" text="Loading..." />
        ) : data.length === 0 ? (
          <div className="notification-panel-empty">
            <Bell size={32} color="#d1d5db" />
            <span>No notifications</span>
          </div>
        ) : (
          <div className="notification-panel-list">
            {data.slice(0, 10).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>

      <div className="notification-panel-footer">
        <button className="notification-panel-view-all" onClick={handleViewAll}>
          View All Notifications
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;