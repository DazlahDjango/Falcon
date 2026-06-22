// src/components/reviews/notifications/NotificationPreferences.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Mail, Clock, Save } from 'lucide-react';
import { useReviewsSystemSettings } from '../../../hooks/reviews';

const NotificationPreferences = ({ settings, onSave, isSaving }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (settings) {
      setFormData({
        email_notifications: settings.email_notifications !== undefined ? settings.email_notifications : true,
        in_app_notifications: settings.in_app_notifications !== undefined ? settings.in_app_notifications : true,
        review_cycle_notifications: settings.review_cycle_notifications !== undefined ? settings.review_cycle_notifications : true,
        deadline_reminders: settings.deadline_reminders !== undefined ? settings.deadline_reminders : true,
        pip_notifications: settings.pip_notifications !== undefined ? settings.pip_notifications : true,
        promotion_notifications: settings.promotion_notifications !== undefined ? settings.promotion_notifications : true,
        feedback_notifications: settings.feedback_notifications !== undefined ? settings.feedback_notifications : true,
        calibration_notifications: settings.calibration_notifications !== undefined ? settings.calibration_notifications : true,
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="notification-preferences-page" onSubmit={handleSubmit}>
      <div className="notification-preferences-page-header">
        <h3 className="notification-preferences-page-title">
          <Bell size={18} />
          Notification Settings
        </h3>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="notification-preferences-page-grid">
        <div className="notification-preferences-page-group">
          <label className="notification-preferences-page-label">Email Notifications</label>
          <div className="notification-preferences-page-toggle">
            <input
              type="checkbox"
              checked={formData.email_notifications}
              onChange={(e) => handleChange('email_notifications', e.target.checked)}
            />
            <span>{formData.email_notifications ? 'Enabled' : 'Disabled'}</span>
          </div>
          <span className="notification-preferences-page-hint">Receive notifications via email</span>
        </div>

        <div className="notification-preferences-page-group">
          <label className="notification-preferences-page-label">In-App Notifications</label>
          <div className="notification-preferences-page-toggle">
            <input
              type="checkbox"
              checked={formData.in_app_notifications}
              onChange={(e) => handleChange('in_app_notifications', e.target.checked)}
            />
            <span>{formData.in_app_notifications ? 'Enabled' : 'Disabled'}</span>
          </div>
          <span className="notification-preferences-page-hint">Receive notifications in the app</span>
        </div>

        <div className="notification-preferences-page-group">
          <label className="notification-preferences-page-label">Review Cycle Notifications</label>
          <div className="notification-preferences-page-toggle">
            <input
              type="checkbox"
              checked={formData.review_cycle_notifications}
              onChange={(e) => handleChange('review_cycle_notifications', e.target.checked)}
            />
            <span>{formData.review_cycle_notifications ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="notification-preferences-page-group">
          <label className="notification-preferences-page-label">Deadline Reminders</label>
          <div className="notification-preferences-page-toggle">
            <input
              type="checkbox"
              checked={formData.deadline_reminders}
              onChange={(e) => handleChange('deadline_reminders', e.target.checked)}
            />
            <span>{formData.deadline_reminders ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="notification-preferences-page-group">
          <label className="notification-preferences-page-label">PIP Notifications</label>
          <div className="notification-preferences-page-toggle">
            <input
              type="checkbox"
              checked={formData.pip_notifications}
              onChange={(e) => handleChange('pip_notifications', e.target.checked)}
            />
            <span>{formData.pip_notifications ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="notification-preferences-page-group">
          <label className="notification-preferences-page-label">Promotion Notifications</label>
          <div className="notification-preferences-page-toggle">
            <input
              type="checkbox"
              checked={formData.promotion_notifications}
              onChange={(e) => handleChange('promotion_notifications', e.target.checked)}
            />
            <span>{formData.promotion_notifications ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="notification-preferences-page-group">
          <label className="notification-preferences-page-label">Feedback Notifications</label>
          <div className="notification-preferences-page-toggle">
            <input
              type="checkbox"
              checked={formData.feedback_notifications}
              onChange={(e) => handleChange('feedback_notifications', e.target.checked)}
            />
            <span>{formData.feedback_notifications ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        <div className="notification-preferences-page-group">
          <label className="notification-preferences-page-label">Calibration Notifications</label>
          <div className="notification-preferences-page-toggle">
            <input
              type="checkbox"
              checked={formData.calibration_notifications}
              onChange={(e) => handleChange('calibration_notifications', e.target.checked)}
            />
            <span>{formData.calibration_notifications ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default NotificationPreferences;