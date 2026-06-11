import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FiSave, FiRefreshCw, FiAlertCircle, FiShield, FiLock, FiMonitor, FiSettings } from 'react-icons/fi';
import { useAccountsSystemSettings } from '../../../hooks/accounts/useAccountsSystemSettings';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import Spinner from '../../common/UI/Spinner';

const SystemPolicyTab = () => {
    const dispatch = useDispatch();
    const {
        form,
        version,
        isLoading,
        isSaving,
        error,
        save,
        reset,
        updateField,
        toggleMfaRole,
    } = useAccountsSystemSettings(true);

    const [isEditing, setIsEditing] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [localForm, setLocalForm] = useState(null);

    useEffect(() => {
        if (form) {
            setLocalForm(form);
        }
    }, [form]);

    const handleSave = async () => {
        try {
            await save();
            setIsEditing(false);
            dispatch(showAlert({ 
                type: 'success', 
                message: `Platform policy saved successfully (v${version + 1})` 
            }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to save platform policy' }));
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset platform security policy to canonical defaults? This action cannot be undone.')) return;
        try {
            await reset();
            setShowResetConfirm(false);
            setIsEditing(false);
            dispatch(showAlert({ type: 'success', message: 'Platform policy reset to defaults' }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to reset policy' }));
        }
    };

    const handleLocalChange = (section, field, value) => {
        if (!isEditing) return;
        setLocalForm(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleLocalMfaRoleToggle = (role) => {
        if (!isEditing) return;
        setLocalForm(prev => {
            const roles = prev.mfa.required_roles || [];
            const next = roles.includes(role)
                ? roles.filter(r => r !== role)
                : [...roles, role];
            return { ...prev, mfa: { ...prev.mfa, required_roles: next } };
        });
    };

    const handleApplyChanges = () => {
        if (localForm) {
            Object.keys(localForm).forEach(section => {
                Object.keys(localForm[section]).forEach(field => {
                    updateField(section, field, localForm[section][field]);
                });
            });
        }
        handleSave();
    };

    if (isLoading || !localForm) {
        return <SkeletonLoader type="card" count={2} />;
    }

    const MFA_ROLE_OPTIONS = [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'client_admin', label: 'Client Admin' },
        { value: 'executive', label: 'Executive' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'staff', label: 'Staff' },
        { value: 'read_only', label: 'Read Only' },
    ];

    return (
        <div className="security-panel">
            <div className="panel-header">
                <div className="header-info">
                    <h3><FiSettings /> Platform Security Policy</h3>
                    <p className="policy-version">
                        Platform-wide defaults (singleton). Version <strong>{version}</strong>.
                        Tenants inherit via sync; client admins may override per tenant.
                    </p>
                </div>
                <div className="header-actions">
                    {!isEditing ? (
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Policy
                        </button>
                    ) : (
                        <>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => {
                                    setLocalForm(form);
                                    setIsEditing(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleApplyChanges}
                                disabled={isSaving}
                            >
                                {isSaving ? <Spinner size="sm" /> : <FiSave size={14} />}
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <FiAlertCircle />
                    <span>{error}</span>
                </div>
            )}

            <div className="policy-grid">
                {/* Lockout Policy */}
                <div className="policy-card editable">
                    <h4><FiLock /> Lockout Policy</h4>
                    <div className="form-group">
                        <label>Failure Limit</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.lockout.failure_limit}
                            onChange={(e) => handleLocalChange('lockout', 'failure_limit', Number(e.target.value))}
                            disabled={!isEditing}
                            min="1"
                            max="20"
                        />
                        <small>Number of failed attempts before lockout</small>
                    </div>
                    <div className="form-group">
                        <label>Lockout Window (minutes)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.lockout.lockout_minutes}
                            onChange={(e) => handleLocalChange('lockout', 'lockout_minutes', Number(e.target.value))}
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
                            className="form-input"
                            value={localForm.lockout.ip_failure_limit}
                            onChange={(e) => handleLocalChange('lockout', 'ip_failure_limit', Number(e.target.value))}
                            disabled={!isEditing}
                            min="5"
                            max="50"
                        />
                        <small>Failed attempts from same IP before blocking</small>
                    </div>
                </div>

                {/* JWT Policy */}
                <div className="policy-card editable">
                    <h4><FiShield /> JWT Token Policy</h4>
                    <div className="form-group">
                        <label>Access Token Lifetime (minutes)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.jwt.access_token_lifetime_minutes}
                            onChange={(e) => handleLocalChange('jwt', 'access_token_lifetime_minutes', Number(e.target.value))}
                            disabled={!isEditing}
                            min="5"
                            max="1440"
                        />
                    </div>
                    <div className="form-group">
                        <label>Refresh Token Lifetime (days)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.jwt.refresh_token_lifetime_days}
                            onChange={(e) => handleLocalChange('jwt', 'refresh_token_lifetime_days', Number(e.target.value))}
                            disabled={!isEditing}
                            min="1"
                            max="30"
                        />
                    </div>
                </div>

                {/* Session Policy */}
                <div className="policy-card editable">
                    <h4><FiMonitor /> Session Policy</h4>
                    <div className="form-group">
                        <label>Max Concurrent Sessions</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.sessions.max_concurrent_sessions}
                            onChange={(e) => handleLocalChange('sessions', 'max_concurrent_sessions', Number(e.target.value))}
                            disabled={!isEditing}
                            min="1"
                            max="20"
                        />
                    </div>
                    <div className="form-group">
                        <label>Session Timeout (minutes)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.sessions.default_timeout_minutes}
                            onChange={(e) => handleLocalChange('sessions', 'default_timeout_minutes', Number(e.target.value))}
                            disabled={!isEditing}
                            min="15"
                            max="1440"
                        />
                    </div>
                    <div className="form-group">
                        <label>Session Retention (days)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.sessions.retention_days}
                            onChange={(e) => handleLocalChange('sessions', 'retention_days', Number(e.target.value))}
                            disabled={!isEditing}
                            min="7"
                            max="365"
                        />
                    </div>
                </div>

                {/* MFA Policy */}
                <div className="policy-card editable">
                    <h4><FiShield /> MFA Policy</h4>
                    <div className="form-group">
                        <label>Password Expiry (days)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.password.expiry_days}
                            onChange={(e) => handleLocalChange('password', 'expiry_days', Number(e.target.value))}
                            disabled={!isEditing}
                            min="30"
                            max="365"
                        />
                    </div>
                    <div className="form-group">
                        <label>Audit Log Retention (days)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={localForm.audit.retention_days}
                            onChange={(e) => handleLocalChange('audit', 'retention_days', Number(e.target.value))}
                            disabled={!isEditing}
                            min="30"
                            max="3650"
                        />
                    </div>
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={localForm.mfa.enforce_for_all}
                                onChange={(e) => handleLocalChange('mfa', 'enforce_for_all', e.target.checked)}
                                disabled={!isEditing}
                            />
                            Enforce MFA for all users
                        </label>
                    </div>
                    <div className="form-group">
                        <label>MFA Required Roles</label>
                        <div className="role-checkboxes">
                            {MFA_ROLE_OPTIONS.map(({ value, label }) => (
                                <label key={value} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={localForm.mfa.required_roles?.includes(value)}
                                        onChange={() => handleLocalMfaRoleToggle(value)}
                                        disabled={!isEditing || localForm.mfa.enforce_for_all}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                        <small>Selected roles will be required to enable MFA</small>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="danger-zone">
                <h4>Danger Zone</h4>
                <div className="danger-action">
                    <div>
                        <strong>Reset to Defaults</strong>
                        <p>Restore all platform settings to factory defaults</p>
                    </div>
                    <button 
                        className="btn btn-danger" 
                        onClick={() => setShowResetConfirm(true)}
                        disabled={isSaving}
                    >
                        <FiRefreshCw size={14} /> Reset to Defaults
                    </button>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiAlertCircle className="modal-icon warning" />
                            <h3>Reset Platform Policy?</h3>
                        </div>
                        <p>This action will reset all platform security settings to their default values.</p>
                        <p className="warning-text">This cannot be undone. Tenants will need to sync to receive the changes.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleReset}>
                                Yes, Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemPolicyTab;