import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSave, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { fetchSystemConfig, updateSystemConfig, clearCache } from '../../../store/accounts/slice/adminSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';

const AdminSystem = () => {
    const dispatch = useDispatch();
    const { systemConfig, isLoading } = useSelector((state) => state.admin);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
    useEffect(() => {
        dispatch(fetchSystemConfig());
    }, [dispatch]);
    useEffect(() => {
        if (systemConfig) {
            setFormData(systemConfig);
        }
    }, [systemConfig]);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checked' ? checked : value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await dispatch(updateSystemConfig(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'System configuration updated' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to update configuration' }));
        } finally{
            setSaving(false);
        }
    };
    const handleClearCache = async (e) => {
        try {
            await dispatch(clearCache()).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Cache cleared successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to clear cache' }));
        }
        setShowClearCacheConfirm(false);
    };
    if (isLoading && !systemConfig) {
        return <SkeletonLoader type='form' />;
    }
    return (
        <div className="admin-system">
            <div className="page-header">
                <h1>System Configuration</h1>
                <p>Manage global system settings</p>
            </div>
            
            <form onSubmit={handleSubmit} className="system-form">
                <div className="form-section">
                    <h2>General Settings</h2>
                    <div className="form-group">
                        <label>System Name</label>
                        <input
                            type="text"
                            name="system_name"
                            value={formData.system_name || ''}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Support Email</label>
                        <input
                            type="email"
                            name="support_email"
                            value={formData.support_email || ''}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>
                
                <div className="form-section">
                    <h2>Security Settings</h2>
                    <div className="form-group">
                        <label>Password Minimum Length</label>
                        <input
                            type="number"
                            name="password_min_length"
                            value={formData.password_min_length || 8}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password Expiry (days)</label>
                        <input
                            type="number"
                            name="password_expiry_days"
                            value={formData.password_expiry_days || 90}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="require_mfa_admins"
                                checked={formData.require_mfa_admins || false}
                                onChange={handleChange}
                            />
                            <span>Require MFA for Admin Users</span>
                        </label>
                    </div>
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="session_timeout_enabled"
                                checked={formData.session_timeout_enabled || true}
                                onChange={handleChange}
                            />
                            <span>Enable Session Timeout</span>
                        </label>
                    </div>
                </div>
                
                <div className="form-section">
                    <h2>Rate Limiting</h2>
                    <div className="form-group">
                        <label>API Requests per Minute (Default)</label>
                        <input
                            type="number"
                            name="rate_limit_default"
                            value={formData.rate_limit_default || 60}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Login Attempts per IP (15 min)</label>
                        <input
                            type="number"
                            name="login_attempts_limit"
                            value={formData.login_attempts_limit || 5}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>
                
                <div className="form-section">
                    <h2>Data Retention</h2>
                    <div className="form-group">
                        <label>Audit Log Retention (days)</label>
                        <input
                            type="number"
                            name="audit_retention_days"
                            value={formData.audit_retention_days || 365}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Session Log Retention (days)</label>
                        <input
                            type="number"
                            name="session_retention_days"
                            value={formData.session_retention_days || 90}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>
                
                <div className="form-section warning">
                    <div className="section-header">
                        <FiAlertTriangle size={20} />
                        <h2>Danger Zone</h2>
                    </div>
                    <div className="danger-actions">
                        <button type="button" className="btn btn-danger" onClick={() => setShowClearCacheConfirm(true)}>
                            <FiRefreshCw size={16} />
                            Clear All Cache
                        </button>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        <FiSave size={16} />
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
            
            <ConfirmationDialog
                isOpen={showClearCacheConfirm}
                onClose={() => setShowClearCacheConfirm(false)}
                onConfirm={handleClearCache}
                type="warning"
                title="Clear System Cache"
                message="This will clear all cached data including sessions, API responses, and configuration. This action cannot be undone."
                confirmText="Clear Cache"
            />
        </div>
    );
};
export default AdminSystem;