// src/pages/reviews/settings/NotificationPreferencesPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useReviewsPermissions, useReviewsSystemSettings } from '../../../hooks/reviews';
import { NotificationPreferences } from '../../../components/reviews/settings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const NotificationPreferencesPage = () => {
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
          <p>You do not have permission to view notification preferences.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-empty">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4">Loading notification preferences...</p>
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
            { label: 'Notifications', path: '/reviews/settings/notifications', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <Bell size={24} />
          Notification Preferences
        </h1>
      </div>

      <div className="reviews-page-section">
        <div className="reviews-page-section-content">
          <NotificationPreferences
            settings={settings?.settings}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;