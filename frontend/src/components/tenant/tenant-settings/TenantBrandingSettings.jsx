// frontend/src/components/tenant/tenant-settings/TenantBrandingSettings.jsx
import React, { useState } from 'react';
import './tenant-settings.css';

export const TenantBrandingSettings = ({ branding, onSave, isLoading = false }) => {
    const [primaryColor, setPrimaryColor] = useState(branding?.primary_color || '#1a56db');
    const [secondaryColor, setSecondaryColor] = useState(branding?.secondary_color || '#7e3af2');
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(branding?.logo || null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('primary_color', primaryColor);
        formData.append('secondary_color', secondaryColor);
        if (logo) {
            formData.append('logo', logo);
        }

        await onSave(formData);
    };

    return (
        <div className="tenant-settings-card">
            <div className="tenant-settings-card-header">
                <h3 className="tenant-settings-card-title">Branding Settings</h3>
            </div>
            <div className="tenant-settings-card-content">
                <form onSubmit={handleSubmit} className="tenant-settings-form">
                    <div className="tenant-settings-form-group">
                        <label className="tenant-settings-label">Primary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-12 h-12 border rounded cursor-pointer"
                                disabled={isLoading}
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1 tenant-settings-input"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="tenant-settings-form-group">
                        <label className="tenant-settings-label">Secondary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="w-12 h-12 border rounded cursor-pointer"
                                disabled={isLoading}
                            />
                            <input
                                type="text"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="flex-1 tenant-settings-input"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="tenant-settings-form-group">
                        <label className="tenant-settings-label">Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="tenant-settings-input"
                            disabled={isLoading}
                        />
                        {logoPreview && (
                            <div className="tenant-branding-preview">
                                <img src={logoPreview} alt="Logo preview" className="tenant-branding-logo-preview" />
                                <div className="text-xs text-gray-500 mt-1">Preview</div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Branding'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};