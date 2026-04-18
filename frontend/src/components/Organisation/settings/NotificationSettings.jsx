import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Email Notifications
    email_subscription_renewal: true,
    email_payment_success: true,
    email_payment_failed: true,
    email_trial_ending: true,
    email_domain_verified: true,
    email_quota_exceeded: true,
    email_new_user_invite: true,
    email_user_joined: true,
    email_kpi_reminder: true,
    email_review_due: true,
    
    // In-App Notifications
    inapp_subscription_update: true,
    inapp_team_mention: true,
    inapp_kpi_approved: true,
    inapp_kpi_rejected: true,
    inapp_review_completed: true,
    inapp_task_assigned: true,
    inapp_department_update: true,
    
    // Digest Settings
    digest_enabled: false,
    digest_frequency: 'weekly',
    digest_day: 'monday',
    digest_time: '09:00',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get();
      const data = response.data;
      setSettings(data);
      
      // Load saved notification preferences
      const prefs = data.notification_preferences || {};
      setFormData({
        email_subscription_renewal: prefs.email_subscription_renewal !== false,
        email_payment_success: prefs.email_payment_success !== false,
        email_payment_failed: prefs.email_payment_failed !== false,
        email_trial_ending: prefs.email_trial_ending !== false,
        email_domain_verified: prefs.email_domain_verified !== false,
        email_quota_exceeded: prefs.email_quota_exceeded !== false,
        email_new_user_invite: prefs.email_new_user_invite !== false,
        email_user_joined: prefs.email_user_joined !== false,
        email_kpi_reminder: prefs.email_kpi_reminder !== false,
        email_review_due: prefs.email_review_due !== false,
        inapp_subscription_update: prefs.inapp_subscription_update !== false,
        inapp_team_mention: prefs.inapp_team_mention !== false,
        inapp_kpi_approved: prefs.inapp_kpi_approved !== false,
        inapp_kpi_rejected: prefs.inapp_kpi_rejected !== false,
        inapp_review_completed: prefs.inapp_review_completed !== false,
        inapp_task_assigned: prefs.inapp_task_assigned !== false,
        inapp_department_update: prefs.inapp_department_update !== false,
        digest_enabled: prefs.digest_enabled || false,
        digest_frequency: prefs.digest_frequency || 'weekly',
        digest_day: prefs.digest_day || 'monday',
        digest_time: prefs.digest_time || '09:00',
      });
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setFormData({
      ...formData,
      [field]: !formData[field],
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateNotifications({
        notification_preferences: formData,
      });
      toast.success('Notification settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage how you receive notifications from Falcon PMS
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Receive important updates via email</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Subscription Renewal</p>
                <p className="text-xs text-gray-500">When your subscription is about to renew</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_subscription_renewal')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.email_subscription_renewal ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.email_subscription_renewal ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Success</p>
                <p className="text-xs text-gray-500">When a payment is successfully processed</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_payment_success')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.email_payment_success ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.email_payment_success ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Failed</p>
                <p className="text-xs text-gray-500">When a payment fails</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_payment_failed')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.email_payment_failed ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.email_payment_failed ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Trial Ending Soon</p>
                <p className="text-xs text-gray-500">When your trial period is about to end</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_trial_ending')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.email_trial_ending ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.email_trial_ending ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Domain Verified</p>
                <p className="text-xs text-gray-500">When a custom domain is successfully verified</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_domain_verified')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.email_domain_verified ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.email_domain_verified ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Quota Exceeded</p>
                <p className="text-xs text-gray-500">When you're approaching or exceeded plan limits</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_quota_exceeded')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.email_quota_exceeded ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.email_quota_exceeded ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">KPI Reminder</p>
                <p className="text-xs text-gray-500">Reminders to update your KPIs</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_kpi_reminder')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.email_kpi_reminder ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.email_kpi_reminder ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Review Due</p>
                <p className="text-xs text-gray-500">When performance reviews are due</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_review_due')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.email_review_due ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.email_review_due ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h2 className="text-lg font-medium text-gray-900">In-App Notifications</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Receive notifications within the application</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Subscription Updates</p>
                <p className="text-xs text-gray-500">When your subscription status changes</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('inapp_subscription_update')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.inapp_subscription_update ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.inapp_subscription_update ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Team Mentions</p>
                <p className="text-xs text-gray-500">When someone mentions you in a team</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('inapp_team_mention')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.inapp_team_mention ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.inapp_team_mention ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">KPI Approved</p>
                <p className="text-xs text-gray-500">When your KPI submission is approved</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('inapp_kpi_approved')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.inapp_kpi_approved ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.inapp_kpi_approved ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">KPI Rejected</p>
                <p className="text-xs text-gray-500">When your KPI submission needs changes</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('inapp_kpi_rejected')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.inapp_kpi_rejected ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.inapp_kpi_rejected ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Task Assigned</p>
                <p className="text-xs text-gray-500">When a task is assigned to you</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('inapp_task_assigned')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.inapp_task_assigned ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.inapp_task_assigned ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Digest Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-medium text-gray-900">Email Digest</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Receive summary emails of your activity</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable Email Digest</p>
                <p className="text-xs text-gray-500">Receive periodic summary emails</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('digest_enabled')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.digest_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.digest_enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {formData.digest_enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    name="digest_frequency"
                    value={formData.digest_frequency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {formData.digest_frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Week
                    </label>
                    <select
                      name="digest_day"
                      value={formData.digest_day}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="digest_time"
                    value={formData.digest_time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;