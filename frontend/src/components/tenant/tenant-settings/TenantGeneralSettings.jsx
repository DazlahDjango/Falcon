// frontend/src/components/tenant/tenant-settings/TenantGeneralSettings.jsx
import React, { useState } from 'react';
import './tenant-settings.css';

export const TenantGeneralSettings = ({ settings, onSave, isLoading = false }) => {
    const [formData, setFormData] = useState({
        name: settings?.name || '',
        contact_email: settings?.contact_email || '',
        contact_phone: settings?.contact_phone || '',
        address: settings?.address || '',
        city: settings?.city || '',
        country: settings?.country || 'Kenya',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            setError('Tenant name is required');
            return;
        }

        setError('');
        await onSave(formData);
    };

    return (
        <div className="tenant-settings-card">
            <div className="tenant-settings-card-header">
                <h3 className="tenant-settings-card-title">General Settings</h3>
            </div>
            <div className="tenant-settings-card-content">
                <form onSubmit={handleSubmit} className="tenant-settings-form">
                    {error && (
                        <div className="p-2 bg-red-50 text-red-600 text-sm rounded">
                            {error}
                        </div>
                    )}

                    <div className="tenant-settings-form-group">
                        <label className="tenant-settings-label">Tenant Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="tenant-settings-input"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="tenant-settings-form-group">
                        <label className="tenant-settings-label">Contact Email</label>
                        <input
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            className="tenant-settings-input"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="tenant-settings-form-group">
                        <label className="tenant-settings-label">Contact Phone</label>
                        <input
                            type="tel"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                            className="tenant-settings-input"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="tenant-settings-form-group">
                        <label className="tenant-settings-label">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="tenant-settings-input"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="tenant-settings-form-group">
                            <label className="tenant-settings-label">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="tenant-settings-input"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="tenant-settings-form-group">
                            <label className="tenant-settings-label">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="tenant-settings-input"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};