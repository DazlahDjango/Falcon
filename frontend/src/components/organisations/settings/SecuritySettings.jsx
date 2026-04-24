import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    mfa_required: false,
    session_timeout: 60,
    max_login_attempts: 5,
    password_expiry_days: 90,
    ip_whitelist_enabled: false,
    ip_whitelist: '',
    allowed_domains: '',
    audit_log_retention_days: 90,
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
      setFormData({
        mfa_required: data.mfa_required || false,
        session_timeout: data.session_timeout || 60,
        max_login_attempts: data.max_login_attempts || 5,
        password_expiry_days: data.password_expiry_days || 90,
        ip_whitelist_enabled: data.ip_whitelist_enabled || false,
        ip_whitelist: data.ip_whitelist || '',
        allowed_domains: data.allowed_domains || '',
        audit_log_retention_days: data.audit_log_retention_days || 90,
      });
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast.error('Failed to load security settings');
    } finally {
      setLoading(false);
    }
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
      await settingsApi.updateSecurity(formData);
      toast.success('Security settings saved successfully');
      fetchSettings();
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
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure security policies for your organisation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Authentication Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Authentication</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Require MFA</p>
                <p className="text-xs text-gray-500">All users must set up multi-factor authentication</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mfa_required: !formData.mfa_required })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.mfa_required ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.mfa_required ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="session_timeout"
                value={formData.session_timeout}
                onChange={handleChange}
                min="5"
                max="480"
                className="mt-1 block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Users will be logged out after this period of inactivity
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Login Attempts
              </label>
              <input
                type="number"
                name="max_login_attempts"
                value={formData.max_login_attempts}
                onChange={handleChange}
                min="3"
                max="10"
                className="mt-1 block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Account will be locked after this many failed attempts
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password Expiry (days)
              </label>
              <input
                type="number"
                name="password_expiry_days"
                value={formData.password_expiry_days}
                onChange={handleChange}
                min="30"
                max="365"
                className="mt-1 block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Users must change their password after this many days (0 = never)
              </p>
            </div>
          </div>
        </div>

        {/* IP Whitelist */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">IP Whitelist</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable IP Whitelist</p>
                <p className="text-xs text-gray-500">Restrict access to specific IP addresses</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, ip_whitelist_enabled: !formData.ip_whitelist_enabled })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.ip_whitelist_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.ip_whitelist_enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {formData.ip_whitelist_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Allowed IP Addresses
                </label>
                <textarea
                  name="ip_whitelist"
                  value={formData.ip_whitelist}
                  onChange={handleChange}
                  rows="4"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="192.168.1.1&#10;10.0.0.0/24&#10;203.0.113.0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  One IP address or CIDR range per line
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Allowed Email Domains
              </label>
              <textarea
                name="allowed_domains"
                value={formData.allowed_domains}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="@company.com&#10;@example.org"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only users with these email domains can join (one per line)
              </p>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Data Retention</h2>
          </div>
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Audit Log Retention (days)
              </label>
              <input
                type="number"
                name="audit_log_retention_days"
                value={formData.audit_log_retention_days}
                onChange={handleChange}
                min="30"
                max="730"
                className="mt-1 block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Audit logs older than this will be automatically deleted
              </p>
            </div>
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

export default SecuritySettings;