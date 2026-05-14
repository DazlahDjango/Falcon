import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiSave, FiX } from 'react-icons/fi';

const BillingSettingsForm = ({ 
    initialSettings, 
    onSave, 
    onCancel,
    isLoading = false,
}) => {
    const [settings, setSettings] = useState(initialSettings || {
        billing_email: '',
        billing_phone: '',
        billing_address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'KE',
        },
        tax_id: '',
        currency: 'KES',
        invoice_delivery: 'email',
        auto_renew: true,
        receive_invoice_reminders: true,
        receive_payment_notifications: true,
        receive_quota_alerts: true,
    });
    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setSettings(prev => ({ ...prev, [field]: value }));
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave?.(settings);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Billing Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={settings.billing_email}
                            onChange={(e) => handleChange('billing_email', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="billing@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Billing Phone
                        </label>
                        <input
                            type="tel"
                            value={settings.billing_phone}
                            onChange={(e) => handleChange('billing_phone', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="+254 700 000 000"
                        />
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                        </label>
                        <input
                            type="text"
                            value={settings.billing_address.line1}
                            onChange={(e) => handleChange('billing_address.line1', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Street address"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2 (Optional)
                        </label>
                        <input
                            type="text"
                            value={settings.billing_address.line2}
                            onChange={(e) => handleChange('billing_address.line2', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Apartment, suite, etc."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                value={settings.billing_address.city}
                                onChange={(e) => handleChange('billing_address.city', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State/Province
                            </label>
                            <input
                                type="text"
                                value={settings.billing_address.state}
                                onChange={(e) => handleChange('billing_address.state', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Postal Code
                            </label>
                            <input
                                type="text"
                                value={settings.billing_address.postal_code}
                                onChange={(e) => handleChange('billing_address.postal_code', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                            </label>
                            <select
                                value={settings.billing_address.country}
                                onChange={(e) => handleChange('billing_address.country', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="KE">Kenya</option>
                                <option value="UG">Uganda</option>
                                <option value="TZ">Tanzania</option>
                                <option value="US">United States</option>
                                <option value="GB">United Kingdom</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax ID / VAT Number
                        </label>
                        <input
                            type="text"
                            value={settings.tax_id}
                            onChange={(e) => handleChange('tax_id', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., PIN: A123456789Z"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Currency
                        </label>
                        <select
                            value={settings.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="KES">Kenyan Shilling (KES)</option>
                            <option value="USD">US Dollar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="GBP">British Pound (GBP)</option>
                        </select>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.auto_renew}
                            onChange={(e) => handleChange('auto_renew', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Auto-renew subscription</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.receive_invoice_reminders}
                            onChange={(e) => handleChange('receive_invoice_reminders', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Receive invoice reminders</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.receive_payment_notifications}
                            onChange={(e) => handleChange('receive_payment_notifications', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Receive payment notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.receive_quota_alerts}
                            onChange={(e) => handleChange('receive_quota_alerts', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Receive quota alerts</span>
                    </label>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <FiSave className="w-4 h-4" />
                            Save Settings
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

BillingSettingsForm.propTypes = {
    initialSettings: PropTypes.shape({
        billing_email: PropTypes.string,
        billing_phone: PropTypes.string,
        billing_address: PropTypes.shape({
            line1: PropTypes.string,
            line2: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            postal_code: PropTypes.string,
            country: PropTypes.string,
        }),
        tax_id: PropTypes.string,
        currency: PropTypes.string,
        invoice_delivery: PropTypes.string,
        auto_renew: PropTypes.bool,
        receive_invoice_reminders: PropTypes.bool,
        receive_payment_notifications: PropTypes.bool,
        receive_quota_alerts: PropTypes.bool,
    }),
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    isLoading: PropTypes.bool,
};
export default BillingSettingsForm;