import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { ArrowLeftIcon, BellIcon, MailIcon, ShieldIcon } from '@heroicons/react/24/outline';
import { FiMail, FiShield } from 'react-icons/fi';

const NotificationSettings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        email_notifications: true,
        in_app_notifications: true,
        invoice_reminder_days: 3,
        payment_failure_alerts: true,
        quota_warning_threshold: 80,
        subscription_renewal_reminder: true,
        promotional_emails: false,
        security_alerts: true,
    });
    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };
    const handleSliderChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: parseInt(value) }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Save notification settings:', settings);
    };
    
    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.BILLING_SETTINGS)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
                    <p className="text-gray-500 mt-1">Configure how and when you receive notifications</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <MailIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Enable Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive notifications via email</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.email_notifications}
                                onChange={() => handleToggle('email_notifications')}
                                className="toggle toggle-primary"
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Invoice Reminders</p>
                                <p className="text-sm text-gray-500">Get reminded before invoices are due</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.invoice_reminder_days > 0}
                                onChange={() => handleToggle('invoice_reminder_days')}
                                className="toggle toggle-primary"
                            />
                        </label>
                        {settings.invoice_reminder_days > 0 && (
                            <div className="ml-6 pl-6 border-l-2 border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reminder Days Before Due Date
                                </label>
                                <select
                                    value={settings.invoice_reminder_days}
                                    onChange={(e) => handleSliderChange('invoice_reminder_days', e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="1">1 day before</option>
                                    <option value="3">3 days before</option>
                                    <option value="5">5 days before</option>
                                    <option value="7">7 days before</option>
                                </select>
                            </div>
                        )}
                        <label className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Payment Failure Alerts</p>
                                <p className="text-sm text-gray-500">Get notified when a payment fails</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.payment_failure_alerts}
                                onChange={() => handleToggle('payment_failure_alerts')}
                                className="toggle toggle-primary"
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Subscription Renewal Reminder</p>
                                <p className="text-sm text-gray-500">Get reminded before your subscription renews</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.subscription_renewal_reminder}
                                onChange={() => handleToggle('subscription_renewal_reminder')}
                                className="toggle toggle-primary"
                            />
                        </label>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <BellIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900">In-App Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Enable In-App Notifications</p>
                                <p className="text-sm text-gray-500">Show notifications within the app</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.in_app_notifications}
                                onChange={() => handleToggle('in_app_notifications')}
                                className="toggle toggle-primary"
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Quota Warning Alerts</p>
                                <p className="text-sm text-gray-500">Get alerted when approaching usage limits</p>
                            </div>
                            <div>
                                <select
                                    value={settings.quota_warning_threshold}
                                    onChange={(e) => handleSliderChange('quota_warning_threshold', e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                    disabled={!settings.in_app_notifications}
                                >
                                    <option value="70">70%</option>
                                    <option value="80">80%</option>
                                    <option value="90">90%</option>
                                    <option value="95">95%</option>
                                </select>
                            </div>
                        </label>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Security Alerts</p>
                                <p className="text-sm text-gray-500">Get notified about suspicious account activity</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.security_alerts}
                                onChange={() => handleToggle('security_alerts')}
                                className="toggle toggle-primary"
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Promotional Emails</p>
                                <p className="text-sm text-gray-500">Receive offers, updates, and newsletters</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.promotional_emails}
                                onChange={() => handleToggle('promotional_emails')}
                                className="toggle toggle-primary"
                            />
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(BILLING_ROUTES.BILLING_SETTINGS)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
};
export default NotificationSettings;