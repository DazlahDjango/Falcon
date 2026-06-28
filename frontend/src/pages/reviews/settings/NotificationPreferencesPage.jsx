// src/pages/reviews/settings/NotificationPreferencesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { NotificationPreferences } from '../../../components/reviews/settings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const NotificationPreferencesPage = () => {
  const navigate = useNavigate();
  const { canManageSystemSettings, isAdmin } = useReviewsPermissions();

  if (!canManageSystemSettings && !isAdmin) {
    return (
      <div className="notification-preferences-page">
        <div className="notification-preferences-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view notification preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-preferences-page">
      <div className="notification-preferences-page-header">
        <button className="notification-preferences-page-back" onClick={() => navigate('/reviews/settings')}>
          <ArrowLeft size={20} />
          Back to Settings
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Settings', path: '/reviews/settings' },
            { label: 'Notifications', path: '/reviews/settings/notifications', isActive: true },
          ]}
        />
        <h1 className="notification-preferences-page-title">
          <Bell size={24} />
          Notification Preferences
        </h1>
      </div>

      <div className="notification-preferences-page-content">
        <NotificationPreferences />
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;