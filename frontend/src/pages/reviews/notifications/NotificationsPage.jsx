// src/pages/reviews/notifications/NotificationsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { NotificationList } from '../../../components/reviews/notifications';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { canManageNotifications } = useReviewsPermissions();

  if (!canManageNotifications) {
    return (
      <div className="notifications-page">
        <div className="notifications-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page-header">
        <button className="notifications-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Notifications', path: '/reviews/notifications', isActive: true },
          ]}
        />
        <h1 className="notifications-page-title">
          <Bell size={24} />
          Notifications
        </h1>
      </div>

      <NotificationList />
    </div>
  );
};

export default NotificationsPage;