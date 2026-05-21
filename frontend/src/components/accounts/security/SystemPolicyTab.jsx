import React from 'react';
import { useDispatch } from 'react-redux';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import { useAccountsSystemSettings } from '../../../hooks/accounts/useAccountsSystemSettings';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const MFA_ROLE_OPTIONS = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'client_admin', label: 'Client Admin' },
    { value: 'executive', label: 'Executive' },
    { value: 'supervisor', label: 'Supervisor' },
];

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

    if (isLoading || !form) {
        return <SkeletonLoader type="card" count={2} />;
    }

    const handleSave = async () => {
        try {
            await save();
            dispatch(showAlert({ type: 'success', message: `Platform policy saved (v${version + 1})` }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to save platform policy' }));
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset platform security policy to canonical defaults?')) return;
        try {
            await reset();
            dispatch(showAlert({ type: 'success', message: 'Platform policy reset to defaults' }));
        } catch {
            dispatch(showAlert({ type: 'error', message: 'Failed to reset policy' }));
        }
    };

    return (
        <div className="accounts-security-panel">
            <p className="accounts-security-readonly">
                Platform-wide defaults (singleton). Version <strong>{version}</strong>.
                Tenants inherit via sync; client admins may override per tenant.
            </p>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="accounts-security-policy-grid">
                <div className="accounts-security-policy-card">
                    <h4>Lockout</h4>
                    <label>Failure limit</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.lockout.failure_limit}
                        onChange={(e) => updateField('lockout', 'failure_limit', Number(e.target.value))}
                    />
                    <label>Lockout window (minutes)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.lockout.lockout_minutes}
                        onChange={(e) => updateField('lockout', 'lockout_minutes', Number(e.target.value))}
                    />
                </div>
                <div className="accounts-security-policy-card">
                    <h4>JWT</h4>
                    <label>Access token (minutes)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.jwt.access_token_lifetime_minutes}
                        onChange={(e) => updateField('jwt', 'access_token_lifetime_minutes', Number(e.target.value))}
                    />
                    <label>Refresh token (days)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.jwt.refresh_token_lifetime_days}
                        onChange={(e) => updateField('jwt', 'refresh_token_lifetime_days', Number(e.target.value))}
                    />
                </div>
                <div className="accounts-security-policy-card">
                    <h4>Sessions</h4>
                    <label>Max concurrent</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.sessions.max_concurrent_sessions}
                        onChange={(e) => updateField('sessions', 'max_concurrent_sessions', Number(e.target.value))}
                    />
                    <label>Timeout (minutes)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={form.sessions.default_timeout_minutes}
                        onChange={(e) => updateField('sessions', 'default_timeout_minutes', Number(e.target.value))}
                    />
                </div>
                <div className="accounts-security-policy-card">
                    <h4>MFA required roles</h4>
                    {MFA_ROLE_OPTIONS.map(({ value, label }) => (
                        <label key={value} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={form.mfa.required_roles.includes(value)}
                                onChange={() => toggleMfaRole(value)}
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="accounts-security-actions">
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                    <FiSave size={14} /> Save platform policy
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={isSaving}>
                    <FiRefreshCw size={14} /> Reset to defaults
                </button>
            </div>
        </div>
    );
};

export default SystemPolicyTab;
