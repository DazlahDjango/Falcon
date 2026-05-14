import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { FiArrowLeft, FiKey } from 'react-icons/fi';

const ApiKeyCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        permissions: ['read'],
        expires_in_days: 365,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // API call would go here
        navigate(BILLING_ROUTES.API_KEYS);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.API_KEYS)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create API Key</h1>
                    <p className="text-gray-500 mt-1">Generate a new API key for programmatic access</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Key Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Key Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="e.g., Production Server, CI/CD Pipeline"
                        />
                        <p className="text-xs text-gray-500 mt-1">Give your key a descriptive name to identify its purpose</p>
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permissions
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.includes('read')}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({ ...formData, permissions: [...formData.permissions, 'read'] });
                                        } else {
                                            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== 'read') });
                                        }
                                    }}
                                    className="rounded border-gray-300 text-primary-600"
                                />
                                <span className="text-sm text-gray-700">Read</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.includes('write')}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({ ...formData, permissions: [...formData.permissions, 'write'] });
                                        } else {
                                            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== 'write') });
                                        }
                                    }}
                                    className="rounded border-gray-300 text-primary-600"
                                />
                                <span className="text-sm text-gray-700">Write</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.includes('admin')}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({ ...formData, permissions: [...formData.permissions, 'admin'] });
                                        } else {
                                            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== 'admin') });
                                        }
                                    }}
                                    className="rounded border-gray-300 text-primary-600"
                                />
                                <span className="text-sm text-gray-700">Admin (full access)</span>
                            </label>
                        </div>
                    </div>

                    {/* Expiration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiration
                        </label>
                        <select
                            value={formData.expires_in_days}
                            onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="30">30 days</option>
                            <option value="90">90 days</option>
                            <option value="180">180 days</option>
                            <option value="365">1 year</option>
                            <option value="0">No expiration</option>
                        </select>
                    </div>

                    {/* Security Note */}
                    <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="flex items-start gap-2">
                            <FiKey className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                Store your API key securely. It provides access to your account data. Never share it publicly or commit it to version control.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(BILLING_ROUTES.API_KEYS)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Create API Key
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiKeyCreate;