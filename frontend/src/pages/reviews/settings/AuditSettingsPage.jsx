// src/pages/reviews/settings/AuditSettingsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { AuditSettings } from '../../../components/reviews/settings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const AuditSettingsPage = () => {
  const navigate = useNavigate();
  const { canManageSystemSettings, isAdmin } = useReviewsPermissions();

  if (!canManageSystemSettings && !isAdmin) {
    return (
      <div className="audit-settings-page">
        <div className="audit-settings-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view audit settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-settings-page">
      <div className="audit-settings-page-header">
        <button className="audit-settings-page-back" onClick={() => navigate('/reviews/settings')}>
          <ArrowLeft size={20} />
          Back to Settings
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Settings', path: '/reviews/settings' },
            { label: 'Audit', path: '/reviews/settings/audit', isActive: true },
          ]}
        />
        <h1 className="audit-settings-page-title">
          <Shield size={24} />
          Audit & Security Settings
        </h1>
      </div>

      <div className="audit-settings-page-content">
        <AuditSettings />
      </div>
    </div>
  );
};

export default AuditSettingsPage;