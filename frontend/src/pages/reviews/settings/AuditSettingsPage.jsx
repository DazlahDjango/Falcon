// src/pages/reviews/settings/AuditSettingsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useReviewsPermissions, useReviewsSystemSettings } from '../../../hooks/reviews';
import { AuditSettings } from '../../../components/reviews/settings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const AuditSettingsPage = () => {
  const navigate = useNavigate();
  const { canManageSystemSettings, isAdmin } = useReviewsPermissions();
  const { settings, loading, fetchSettings, updateSettings } = useReviewsSystemSettings();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      await updateSettings({ settings: formData });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!canManageSystemSettings && !isAdmin) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view audit settings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-empty">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4">Loading audit settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page-header">
        <button className="reviews-page-back" onClick={() => navigate('/reviews/settings')}>
          <ArrowLeft size={20} />
          Back to Settings
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Settings', path: '/reviews/settings' },
            { label: 'Audit', path: '/reviews/settings/audit', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <Shield size={24} />
          Audit & Security Settings
        </h1>
      </div>

      <div className="reviews-page-section">
        <div className="reviews-page-section-content">
          <AuditSettings
            settings={settings?.settings}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default AuditSettingsPage;