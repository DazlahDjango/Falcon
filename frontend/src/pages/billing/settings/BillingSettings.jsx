import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentSubscription } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import BillingSettingsForm from '../../../components/billing/BillingSettingsForm';
import { Spinner } from '../../../components/common/UI';
import { FiArrowLeft, FiBell, FiCreditCard, FiKey, FiActivity } from 'react-icons/fi';

const BillingSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('billing');
    const { data: subscription, isLoading } = useCurrentSubscription();
    const tabs = [
        { id: 'billing', label: 'Billing Information', icon: FiCreditCard },
        { id: 'notifications', label: 'Notifications', icon: FiBell },
        { id: 'api', label: 'API Keys', icon: FiKey },
        { id: 'webhooks', label: 'Webhooks', icon: FiActivity },
    ];
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(BILLING_ROUTES.DASHBOARD)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Billing Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your billing preferences and configurations</p>
                </div>
            </div>
            <div className="border-b border-gray-200">
                <nav className="flex gap-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                {activeTab === 'billing' && (
                    <BillingSettingsForm
                        initialSettings={{
                            billing_email: subscription?.tenant?.contact_email || '',
                            billing_phone: '',
                            currency: 'KES',
                            auto_renew: true,
                            receive_invoice_reminders: true,
                            receive_payment_notifications: true,
                            receive_quota_alerts: true,
                        }}
                        onSave={(settings) => {
                            console.log('Save settings:', settings);
                        }}
                        onCancel={() => navigate(BILLING_ROUTES.DASHBOARD)}
                    />
                )}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Invoice Reminders</p>
                                    <p className="text-sm text-gray-500">Receive email reminders when an invoice is due</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                            </label>
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Payment Confirmations</p>
                                    <p className="text-sm text-gray-500">Receive confirmation when payments are processed</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                            </label>
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Payment Failures</p>
                                    <p className="text-sm text-gray-500">Get alerts when a payment fails</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                            </label>
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Quota Alerts</p>
                                    <p className="text-sm text-gray-500">Get notified when you're approaching usage limits</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                            </label>          
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Subscription Updates</p>
                                    <p className="text-sm text-gray-500">Receive updates about plan changes and renewals</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                            </label>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                Save Preferences
                            </button>
                        </div>
                    </div>
                )}                
                {activeTab === 'api' && (
                    <div className="text-center py-8">
                        <FiKey className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">API Access</h3>
                        <p className="text-gray-500 mb-4">
                            API access is available on Professional and Enterprise plans.
                        </p>
                        {subscription?.plan?.plan_type !== 'professional' && subscription?.plan?.plan_type !== 'enterprise' ? (
                            <button
                                onClick={() => navigate(BILLING_ROUTES.SUBSCRIPTION_UPGRADE)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                Upgrade to Access API
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(BILLING_ROUTES.API_KEYS)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                Manage API Keys
                            </button>
                        )}
                    </div>
                )}
                {activeTab === 'webhooks' && (
                    <div className="text-center py-8">
                        <FiActivity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Webhook Endpoints</h3>
                        <p className="text-gray-500 mb-4">
                            Configure webhook endpoints to receive real-time events from Falcon PMS.
                        </p>
                        {subscription?.plan?.plan_type !== 'professional' && subscription?.plan?.plan_type !== 'enterprise' ? (
                            <button
                                onClick={() => navigate(BILLING_ROUTES.SUBSCRIPTION_UPGRADE)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                Upgrade to Use Webhooks
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(BILLING_ROUTES.WEBHOOKS)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                Manage Webhooks
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default BillingSettings;