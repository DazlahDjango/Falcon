// src/components/reviews/notifications/NotificationBadge.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useReviewsNotifications } from '../../../hooks/reviews';

const NotificationBadge = ({ onClick, showLabel = false }) => {
  const navigate = useNavigate();
  const { unreadCount = 0, fetchUnreadCount, getUnreadCount, canManage } = useReviewsNotifications();
  const loadCount = fetchUnreadCount || getUnreadCount;

  useEffect(() => {
    if (canManage && typeof loadCount === 'function') {
      loadCount();
      const interval = setInterval(loadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [canManage, loadCount]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/reviews/notifications');
    }
  };

  if (!canManage) return null;

  return (
    <button className="notification-badge" onClick={handleClick}>
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="notification-badge-count">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {showLabel && <span className="notification-badge-label">Notifications</span>}
    </button>
  );
};

export default NotificationBadge;