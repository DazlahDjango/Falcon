import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiSettings,
    FiSave,
    FiRefreshCw,
    FiAlertCircle,
    FiCheckCircle,
    FiShield,
    FiClock,
    FiUsers,
    FiDatabase,
    FiTrash2,
    FiLoader,
    FiServer,
    FiGlobe,
    FiLock
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';

const SystemSettings = () => {
    const dispatch = useDispatch();
    const {
        systemSettings,
        systemSettingsLoading,
        systemSettingsUpdating,
        syncingPolicy,
        loadSystemSettings,
        updateSystemSettings,
        resetSystemSettings,
        syncPolicyToAllTenants,
    } = useAdminMFA();

    const [settings, setSettings] = useState({
        sessions: {
            max_concurrent_sessions: 5,
            default_timeout_minutes: 480,
            retention_days: 90,
        },
        mfa: {
            required_roles: [],
        },
        password: {
            expiry_days: 90,
        },
        audit: {
            retention_days: 365,
        },
        lockout: {
            failure_limit: 5,
            lockout_minutes: 15,
            ip_failure_limit: 5,
        },
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showSyncConfirm, setShowSyncConfirm] = useState(false);

    useEffect(() => {
        loadSystemSettings();
    }, [loadSystemSettings]);

    useEffect(() => {
        if (systemSettings) {
            setSettings({
                sessions: systemSettings.sessions || settings.sessions,
                mfa: systemSettings.mfa || settings.mfa,
                password: systemSettings.password || settings.password,
                audit: systemSettings.audit || settings.audit,
                lockout: systemSettings.lockout || settings.lockout,
            });
        }
    }, [systemSettings]);

    const handleChange = (category, field, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        try {
            await updateSystemSettings(settings);
            setIsEditing(false);
            dispatch(showAlert({ type: 'success', message: 'System settings updated successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to update system settings' }));
        }
    };

    const handleReset = async () => {
        try {
            await resetSystemSettings();
            setShowResetConfirm(false);
            setIsEditing(false);
            dispatch(showAlert({ type: 'success', message: 'System settings reset to defaults' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to reset system settings' }));
        }
    };

    const handleSyncPolicy = async () => {
        try {
            await syncPolicyToAllTenants();
            setShowSyncConfirm(false);
            dispatch(showAlert({ type: 'success', message: 'Policy synced to all tenants successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to sync policy' }));
        }
    };

    if (systemSettingsLoading) {
        return (
            <div className="system-settings-loading">
                <Spinner size="lg" />
                <p>Loading system settings...</p>
            </div>
        );
    }

    return (
        <div className="system-settings">
            {/* Header */}
            <div className="settings-header">
                <div className="header-title">
                    <FiSettings className="header-icon" />
                    <div>
                        <h1>System Settings</h1>
                        <p>Configure global system policies and security settings</p>
                    </div>
                </div>
                <div className="header-actions">
                    {!isEditing ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            <FiSave /> Edit Settings
                        </button>
                    ) : (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setSettings(systemSettings);
                                    setIsEditing(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={systemSettingsUpdating}
                            >
                                {systemSettingsUpdating ? <Spinner size="sm" /> : <FiSave />}
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="settings-stats">
                <div className="stat-card">
                    <div className="stat-icon"><FiShield /></div>
                    <div className="stat-info">
                        <div className="stat-value">{settings.lockout.failure_limit}</div>
                        <div className="stat-label">Failed Attempts Before Lockout</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiClock /></div>
                    <div className="stat-info">
                        <div className="stat-value">{settings.sessions.default_timeout_minutes}</div>
                        <div className="stat-label">Session Timeout (minutes)</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiUsers /></div>
                    <div className="stat-info">
                        <div className="stat-value">{settings.sessions.max_concurrent_sessions}</div>
                        <div className="stat-label">Max Concurrent Sessions</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiDatabase /></div>
                    <div className="stat-info">
                        <div className="stat-value">{settings.audit.retention_days}</div>
                        <div className="stat-label">Audit Log Retention (days)</div>
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="settings-sections">
                {/* Session Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <FiServer className="section-icon" />
                        <h2>Session Management</h2>
                    </div>
                    <div className="section-content">
                        <div className="form-group">
                            <label>Max Concurrent Sessions</label>
                            <input
                                type="number"
                                value={settings.sessions.max_concurrent_sessions}
                                onChange={(e) => handleChange('sessions', 'max_concurrent_sessions', parseInt(e.target.value))}
                                disabled={!isEditing}
                                min="1"
                                max="50"
                            />
                            <small>Maximum number of simultaneous sessions per user</small>
                        </div>
                        <div className="form-group">
                            <label>Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={settings.sessions.default_timeout_minutes}
                                onChange={(e) => handleChange('sessions', 'default_timeout_minutes', parseInt(e.target.value))}
                                disabled={!isEditing}
                                min="5"
                                max="1440"
                            />
                            <small>User will be logged out after inactivity</small>
                        </div>
                        <div className="form-group">
                            <label>Session Retention (days)</label>
                            <input
                                type="number"
                                value={settings.sessions.retention_days}
                                onChange={(e) => handleChange('sessions', 'retention_days', parseInt(e.target.value))}
                                disabled={!isEditing}
                                min="7"
                                max="365"
                            />
                            <small>How long to keep session records</small>
                        </div>
                    </div>
                </div>

                {/* Lockout Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <FiLock className="section-icon" />
                        <h2>Account Lockout Policy</h2>
                    </div>
                    <div className="section-content">
                        <div className="form-group">
                            <label>Failed Attempt Limit</label>
                            <input
                                type="number"
                                value={settings.lockout.failure_limit}
                                onChange={(e) => handleChange('lockout', 'failure_limit', parseInt(e.target.value))}
                                disabled={!isEditing}
                                min="3"
                                max="20"
                            />
                            <small>Number of failed attempts before lockout</small>
                        </div>
                        <div className="form-group">
                            <label>Lockout Duration (minutes)</label>
                            <input
                                type="number"
                                value={settings.lockout.lockout_minutes}
                                onChange={(e) => handleChange('lockout', 'lockout_minutes', parseInt(e.target.value))}
                                disabled={!isEditing}
                                min="5"
                                max="1440"
                            />
                            <small>How long the account remains locked</small>
                        </div>
                        <div className="form-group">
                            <label>IP Failure Limit</label>
                            <input
                                type="number"
                                value={settings.lockout.ip_failure_limit}
                                onChange={(e) => handleChange('lockout', 'ip_failure_limit', parseInt(e.target.value))}
                                disabled={!isEditing}
                                min="5"
                                max="50"
                            />
                            <small>Failed attempts from same IP before blocking</small>
                        </div>
                    </div>
                </div>

                {/* Password Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <FiLock className="section-icon" />
                        <h2>Password Policy</h2>
                    </div>
                    <div className="section-content">
                        <div className="form-group">
                            <label>Password Expiry (days)</label>
                            <input
                                type="number"
                                value={settings.password.expiry_days}
                                onChange={(e) => handleChange('password', 'expiry_days', parseInt(e.target.value))}
                                disabled={!isEditing}
                                min="30"
                                max="365"
                            />
                            <small>Password expires after this many days</small>
                        </div>
                    </div>
                </div>

                {/* Audit Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <FiDatabase className="section-icon" />
                        <h2>Audit Log Settings</h2>
                    </div>
                    <div className="section-content">
                        <div className="form-group">
                            <label>Audit Log Retention (days)</label>
                            <input
                                type="number"
                                value={settings.audit.retention_days}
                                onChange={(e) => handleChange('audit', 'retention_days', parseInt(e.target.value))}
                                disabled={!isEditing}
                                min="30"
                                max="3650"
                            />
                            <small>How long to keep audit logs</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            <div className="settings-actions">
                <div className="actions-card">
                    <h3>Sync Policy to All Tenants</h3>
                    <p>Push current system policies to all existing tenants</p>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowSyncConfirm(true)}
                        disabled={syncingPolicy}
                    >
                        {syncingPolicy ? <Spinner size="sm" /> : <FiRefreshCw />}
                        Sync Now
                    </button>
                </div>

                <div className="actions-card danger">
                    <h3>Reset to Defaults</h3>
                    <p>Restore all system settings to factory defaults</p>
                    <button
                        className="btn btn-danger"
                        onClick={() => setShowResetConfirm(true)}
                    >
                        <FiTrash2 /> Reset All Settings
                    </button>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiAlertCircle className="modal-icon warning" />
                            <h3>Reset System Settings?</h3>
                        </div>
                        <p>This action will reset all system settings to their default values. This cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleReset}>
                                Yes, Reset All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Confirmation Modal */}
            {showSyncConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiRefreshCw className="modal-icon info" />
                            <h3>Sync Policy to All Tenants?</h3>
                        </div>
                        <p>This will push current system policies to all existing tenants. Tenant-specific overrides will be preserved.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowSyncConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSyncPolicy}>
                                Yes, Sync Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;