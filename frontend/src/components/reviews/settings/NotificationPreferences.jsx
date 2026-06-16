// src/components/reviews/settings/NotificationPreferences.jsx
import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Globe, Clock, RefreshCw } from 'lucide-react';

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
        reminder_days_before: settings.reminder_days_before || 7,
        notification_sound: settings.notification_sound !== undefined ? settings.notification_sound : true,
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
    <form className="notification-preferences" onSubmit={handleSubmit}>
      <div className="notification-preferences-header">
        <h3 className="notification-preferences-title">
          <Bell size={18} />
          Notification Preferences
        </h3>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <div className="notification-preferences-grid">
        <div className="notification-preferences-group">
          <label className="notification-preferences-label">Email Notifications</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.email_notifications}
              onChange={(e) => handleChange('email_notifications', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.email_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Receive notifications via email</span>
        </div>

        <div className="notification-preferences-group">
          <label className="notification-preferences-label">In-App Notifications</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.in_app_notifications}
              onChange={(e) => handleChange('in_app_notifications', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.in_app_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Receive notifications within the app</span>
        </div>

        <div className="notification-preferences-group">
          <label className="notification-preferences-label">Review Cycle Notifications</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.review_cycle_notifications}
              onChange={(e) => handleChange('review_cycle_notifications', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.review_cycle_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Get notified about review cycle updates</span>
        </div>

        <div className="notification-preferences-group">
          <label className="notification-preferences-label">Deadline Reminders</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.deadline_reminders}
              onChange={(e) => handleChange('deadline_reminders', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.deadline_reminders ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Get reminders about upcoming deadlines</span>
        </div>

        <div className="notification-preferences-group">
          <label className="notification-preferences-label">PIP Notifications</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.pip_notifications}
              onChange={(e) => handleChange('pip_notifications', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.pip_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Get notified about PIP updates</span>
        </div>

        <div className="notification-preferences-group">
          <label className="notification-preferences-label">Promotion Notifications</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.promotion_notifications}
              onChange={(e) => handleChange('promotion_notifications', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.promotion_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Get notified about promotion updates</span>
        </div>

        <div className="notification-preferences-group">
          <label className="notification-preferences-label">Feedback Notifications</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.feedback_notifications}
              onChange={(e) => handleChange('feedback_notifications', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.feedback_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Get notified about feedback requests</span>
        </div>

        <div className="notification-preferences-group">
          <label className="notification-preferences-label">Calibration Notifications</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.calibration_notifications}
              onChange={(e) => handleChange('calibration_notifications', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.calibration_notifications ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Get notified about calibration sessions</span>
        </div>
      </div>

      <div className="notification-preferences-row">
        <div className="notification-preferences-group">
          <label className="notification-preferences-label">Reminder Days Before</label>
          <input
            type="number"
            className="notification-preferences-input"
            value={formData.reminder_days_before}
            onChange={(e) => handleChange('reminder_days_before', Number(e.target.value))}
            min={1}
            max={30}
          />
          <span className="notification-preferences-hint">Days before deadline to send reminders</span>
        </div>

        <div className="notification-preferences-group">
          <label className="notification-preferences-label">Notification Sound</label>
          <div className="notification-preferences-toggle">
            <input
              type="checkbox"
              checked={formData.notification_sound}
              onChange={(e) => handleChange('notification_sound', e.target.checked)}
            />
            <span className="notification-preferences-toggle-label">
              {formData.notification_sound ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <span className="notification-preferences-hint">Play sound for notifications</span>
        </div>
      </div>
    </form>
  );
};

export default NotificationPreferences;