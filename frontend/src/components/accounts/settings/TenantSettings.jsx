import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSave, FiUpload, FiGlobe, FiUsers, FiClock, FiShield } from 'react-icons/fi';
import { fetchTenantSettings, updateTenantSettings, updateTenantBranding } from '../../../store/accounts/slice/tenantSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const TenantSettings = () => {
    const dispatch = useDispatch();
    const { tenantSettings, isLoading } = useSelector((state) => state.tenant);
    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        primary_color: '#2563eb',
        secondary_color: '#7c3aed',
        default_language: 'en',
        default_timezone: 'Africa/Nairobi',
        session_timeout_minutes: 480,
        mfa_required_roles: []
    });
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        dispatch(fetchTenantSettings());
    }, [dispatch]);
    useEffect(() => {
        if (tenantSettings) {
            setFormData({
                name: tenantSettings.name || '',
                logo_url: tenantSettings.logo_url || '',
                primary_color: tenantSettings.primary_color || '#2563eb',
                secondary_color: tenantSettings.secondary_color || '#7c3aed',
                default_language: tenantSettings.default_language || 'en',
                default_timezone: tenantSettings.default_timezone || 'Africa/Nairobi',
                session_timeout_minutes: tenantSettings.session_timeout_minutes || 480,
                mfa_required_roles: tenantSettings.mfa_required_roles || []
            });
        }
    }, [tenantSettings]);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleColorChange = (color) => {
        setFormData(prev => ({ ...prev, primary_color: color }));
    };
    const handleRoleToggle = (role) => {
        setFormData(prev => ({
            ...prev,
            mfa_required_roles: prev.mfa_required_roles.includes(role)
                ? prev.mfa_required_roles.filter(r => r !== role)
                : [...prev.mfa_required_roles, role]
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await dispatch(updateTenantSettings(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Tenant settings updated successfuly' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to update settings'}));
        } finally {
            setSaving(false);
        }
    };
    const roles = [
        { value: 'executive', label: 'Executive' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'staff', label: 'Staff' },
        { value: 'read_only', label: 'Read Only' }
    ];
    return (
        <div className="tenant-settings">
            <div className="settings-header">
                <h2>Organization Settings</h2>
                <p>Configure your organization preferences</p>
            </div>
            
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label>Organization Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                
                <div className="form-group">
                    <label>Logo URL</label>
                    <div className="logo-input">
                        <input
                            type="text"
                            name="logo_url"
                            value={formData.logo_url}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                            className="form-input"
                        />
                        <button type="button" className="btn btn-secondary btn-sm">
                            <FiUpload size={14} />
                            Upload
                        </button>
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Primary Color</label>
                        <div className="color-picker">
                            <input
                                type="color"
                                value={formData.primary_color}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="color-input"
                            />
                            <input
                                type="text"
                                value={formData.primary_color}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Secondary Color</label>
                        <div className="color-picker">
                            <input
                                type="color"
                                value={formData.secondary_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                                className="color-input"
                            />
                            <input
                                type="text"
                                value={formData.secondary_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Default Language</label>
                        <select
                            name="default_language"
                            value={formData.default_language}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="en">English</option>
                            <option value="fr">French</option>
                            <option value="es">Spanish</option>
                            <option value="sw">Swahili</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Default Timezone</label>
                        <select
                            name="default_timezone"
                            value={formData.default_timezone}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="Africa/Nairobi">Nairobi (EAT)</option>
                            <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                            <option value="America/New_York">New York (EST)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Asia/Dubai">Dubai (GST)</option>
                        </select>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input
                        type="number"
                        name="session_timeout_minutes"
                        value={formData.session_timeout_minutes}
                        onChange={handleChange}
                        className="form-input"
                    />
                    <small>Users will be logged out after inactivity</small>
                </div>
                
                <div className="form-group">
                    <label>MFA Required Roles</label>
                    <div className="checkbox-group">
                        {roles.map(role => (
                            <label key={role.value} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.mfa_required_roles.includes(role.value)}
                                    onChange={() => handleRoleToggle(role.value)}
                                />
                                <span>{role.label}</span>
                            </label>
                        ))}
                    </div>
                    <small>Selected roles will be required to enable MFA</small>
                </div>
                
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        <FiSave size={16} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default TenantSettings;