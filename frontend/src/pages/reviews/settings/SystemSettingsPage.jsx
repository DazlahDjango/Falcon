// src/pages/reviews/settings/SystemSettingsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SystemSettings } from '../../../components/reviews/settings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SystemSettingsPage = () => {
  const navigate = useNavigate();
  const { canManageSystemSettings, isAdmin } = useReviewsPermissions();

  if (!canManageSystemSettings && !isAdmin) {
    return (
      <div className="system-settings-page">
        <div className="system-settings-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view system settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-settings-page">
      <div className="system-settings-page-header">
        <button className="system-settings-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Settings', path: '/reviews/settings', isActive: true },
          ]}
        />
        <h1 className="system-settings-page-title">
          <Settings size={24} />
          System Settings
        </h1>
      </div>

      <SystemSettings />
    </div>
  );
};

export default SystemSettingsPage;