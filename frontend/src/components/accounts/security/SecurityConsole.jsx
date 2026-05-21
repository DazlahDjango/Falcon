import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FiShield, FiRefreshCw, FiAlertTriangle, FiUsers, FiLock, FiMonitor,
} from 'react-icons/fi';
import { useAccountsSecurity } from '../../../hooks/accounts/useAccountsSecurity';
import { terminateSession } from '../../../store/accounts/slice/sessionSlice';
import { updateTenantSettings } from '../../../store/accounts/slice/tenantSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { ROUTES } from '../../../config/constants';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import SystemPolicyTab from './SystemPolicyTab';
import '../../../styles/accounts/security.css';

const ROLE_OPTIONS = [
    { value: 'client_admin', label: 'Client Admin' },
    { value: 'executive', label: 'Executive' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'staff', label: 'Staff' },
    { value: 'read_only', label: 'Read Only' },
];

const PolicyTab = ({
    policy, isSuperAdmin, isSaving, onSyncTenant, onSyncAll,
}) => {
    const dispatch = useDispatch();
    const p = policy?.policy || {};
    const [form, setForm] = useState(null);

    React.useEffect(() => {
        if (p.mfa || p.sessions) {
            setForm({
                mfa_required_roles: p.mfa?.required_roles || [],
                session_timeout_minutes: p.sessions?.default_timeout_minutes ?? 480,
                max_concurrent_sessions: p.sessions?.max_concurrent_sessions ?? 5,
                password_expiry_days: p.password?.expiry_days ?? 90,
            });
        }
    }, [policy]);

    const handleRoleToggle = (role) => {
        setForm((prev) => ({
            ...prev,
            mfa_required_roles: prev.mfa_required_roles.includes(role)
                ? prev.mfa_required_roles.filter((r) => r !== role)
                : [...prev.mfa_required_roles, role],
        }));
    };

    const handleSaveTenant = async () => {
        try {
            await dispatch(updateTenantSettings(form)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Tenant security policy updated' }));
            onSyncTenant();
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err || 'Update failed' }));
        }
    };

    if (!policy) return <SkeletonLoader type="card" count={2} />;

    return (
        <div className="accounts-security-panel">
            <p className="accounts-security-readonly">
                Policy version {policy.policy_version} — effective settings for tenant{' '}
                <code>{policy.client_id}</code>
                {isSuperAdmin
                    ? ' (platform defaults + tenant overrides; super admin may sync all tenants)'
                    : ' (client admin may edit tenant overrides below)'}
            </p>

            <div className="accounts-security-policy-grid">
                <div className="accounts-security-policy-card">
                    <h4>Lockout</h4>
                    <ul>
                        <li>Failures: {p.lockout?.failure_limit ?? 5} / {p.lockout?.lockout_minutes ?? 15} min</li>
                        <li>IP limit: {p.lockout?.ip_failure_limit ?? 5}</li>
                    </ul>
                </div>
                <div className="accounts-security-policy-card">
                    <h4>JWT</h4>
                    <ul>
                        <li>Access: {p.jwt?.access_token_lifetime_minutes ?? 30} min</li>
                        <li>Refresh: {p.jwt?.refresh_token_lifetime_days ?? 7} days</li>
                    </ul>
                </div>
                <div className="accounts-security-policy-card">
                    <h4>Sessions</h4>
                    <ul>
                        <li>Max devices: {p.sessions?.max_concurrent_sessions ?? 5}</li>
                        <li>Timeout: {p.sessions?.default_timeout_minutes ?? 480} min</li>
                    </ul>
                </div>
                <div className="accounts-security-policy-card">
                    <h4>MFA required roles</h4>
                    <ul>
                        {(p.mfa?.required_roles || []).map((r) => (
                            <li key={r}>{r}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {!isSuperAdmin && form && (
                <div style={{ marginTop: '1.5rem' }}>
                    <h4>Tenant overrides</h4>
                    <div className="form-group">
                        <label>Session timeout (minutes)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={form.session_timeout_minutes}
                            onChange={(e) => setForm({ ...form, session_timeout_minutes: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Max concurrent sessions</label>
                        <input
                            type="number"
                            className="form-input"
                            min={1}
                            max={20}
                            value={form.max_concurrent_sessions}
                            onChange={(e) => setForm({ ...form, max_concurrent_sessions: Number(e.target.value) })}
                        />
                    </div>
                    <div className="form-group">
                        <label>MFA required for roles</label>
                        <div className="role-checkboxes">
                            {ROLE_OPTIONS.map(({ value, label }) => (
                                <label key={value} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={form.mfa_required_roles.includes(value)}
                                        onChange={() => handleRoleToggle(value)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handleSaveTenant} disabled={isSaving}>
                        Save tenant policy
                    </button>
                </div>
            )}

            <div className="accounts-security-actions">
                <button type="button" className="btn btn-secondary" onClick={onSyncTenant} disabled={isSaving}>
                    <FiRefreshCw size={14} /> Sync from platform defaults
                </button>
                {isSuperAdmin && (
                    <button type="button" className="btn btn-secondary" onClick={onSyncAll} disabled={isSaving}>
                        Sync all tenants
                    </button>
                )}
            </div>
        </div>
    );
};

const LockoutsTab = ({ lockoutSummary, loginAttempts, onRefresh, isLoading }) => {
    const badgeClass = (result) => {
        if (result === 'failure') return 'accounts-security-badge accounts-security-badge--failure';
        if (result === 'locked') return 'accounts-security-badge accounts-security-badge--locked';
        return 'accounts-security-badge accounts-security-badge--success';
    };

    return (
        <div>
            <div className="accounts-security-stats">
                <div className="accounts-security-stat">
                    <div className="label">Failures (15m)</div>
                    <div className="value">{lockoutSummary?.failures_last_15m ?? '—'}</div>
                </div>
                <div className="accounts-security-stat">
                    <div className="label">Locked (24h)</div>
                    <div className="value">{lockoutSummary?.locked_attempts_last_24h ?? '—'}</div>
                </div>
                <div className="accounts-security-stat">
                    <div className="label">IPs with failures</div>
                    <div className="value">{lockoutSummary?.unique_ips_with_failures ?? '—'}</div>
                </div>
            </div>

            <div className="accounts-security-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Recent login attempts</h3>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={isLoading}>
                        <FiRefreshCw size={14} /> Refresh
                    </button>
                </div>
                <table className="accounts-security-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Identifier</th>
                            <th>Result</th>
                            <th>Reason</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loginAttempts.length === 0 ? (
                            <tr>
                                <td colSpan={5}>No attempts in the selected window</td>
                            </tr>
                        ) : (
                            loginAttempts.map((row) => (
                                <tr key={row.id}>
                                    <td>{new Date(row.attempted_at).toLocaleString()}</td>
                                    <td>{row.identifier}</td>
                                    <td><span className={badgeClass(row.result)}>{row.result}</span></td>
                                    <td>{row.failure_reason || '—'}</td>
                                    <td>{row.ip_address}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TenantSessionsTab = ({ sessions, onRefresh, onTerminate, isLoading }) => (
    <div className="accounts-security-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Active sessions (tenant)</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={isLoading}>
                <FiRefreshCw size={14} /> Refresh
            </button>
        </div>
        <table className="accounts-security-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Device</th>
                    <th>IP</th>
                    <th>Last activity</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {sessions.length === 0 ? (
                    <tr><td colSpan={5}>No active sessions</td></tr>
                ) : (
                    sessions.map((s) => (
                        <tr key={s.id}>
                            <td>{s.user?.email || s.user_email || '—'}</td>
                            <td>{[s.browser, s.os, s.device_type].filter(Boolean).join(' / ') || '—'}</td>
                            <td>{s.ip_address}</td>
                            <td>{s.last_activity ? new Date(s.last_activity).toLocaleString() : '—'}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => onTerminate(s.id)}
                                >
                                    Revoke
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const SecurityConsole = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('policy');
    const {
        canAccessConsole,
        isSuperAdmin,
        policy,
        lockoutSummary,
        loginAttempts,
        tenantSessions,
        isLoading,
        isSaving,
        error,
        refreshAll,
        loadLoginAttempts,
        loadTenantSessions,
        syncTenantPolicy,
        syncAllTenants,
    } = useAccountsSecurity();

    if (!canAccessConsole) {
        return (
            <div className="accounts-security-console">
                <div className="accounts-security-panel">
                    <FiAlertTriangle size={24} />
                    <p>Security console requires Client Admin or Super Admin role.</p>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(ROUTES.SETTINGS)}>
                        Back to settings
                    </button>
                </div>
            </div>
        );
    }

    const handleSyncAll = async () => {
        try {
            const res = await syncAllTenants();
            dispatch(showAlert({
                type: 'success',
                message: res.data?.message || 'Tenants synced',
            }));
            refreshAll();
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.response?.data?.error || 'Sync failed' }));
        }
    };

    const handleTerminate = async (sessionId) => {
        try {
            await dispatch(terminateSession(sessionId)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Session revoked' }));
            loadTenantSessions();
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.message || 'Revoke failed' }));
        }
    };

    const tabs = [
        { key: 'policy', label: 'Policy', icon: <FiShield size={16} /> },
        ...(isSuperAdmin ? [{ key: 'platform', label: 'Platform policy', icon: <FiShield size={16} /> }] : []),
        { key: 'lockouts', label: 'Lockouts', icon: <FiLock size={16} /> },
        { key: 'sessions', label: 'Tenant sessions', icon: <FiMonitor size={16} /> },
        { key: 'my-sessions', label: 'My sessions', icon: <FiUsers size={16} /> },
    ];

    return (
        <div className="accounts-security-console">
            <div className="page-header">
                <h1><FiShield /> Security console</h1>
                <p>Tenant security policy, failed logins, and session control (CIA-aligned operations)</p>
            </div>

            {error && (
                <div className="alert alert-error" role="alert">{error}</div>
            )}

            <div className="accounts-security-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={activeTab === tab.key ? 'active' : ''}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={refreshAll}
                    disabled={isLoading}
                >
                    <FiRefreshCw size={14} /> Refresh all
                </button>
            </div>

            {isLoading && activeTab === 'policy' && !policy ? (
                <SkeletonLoader type="card" count={2} />
            ) : (
                <>
                    {activeTab === 'policy' && (
                        <PolicyTab
                            policy={policy}
                            isSuperAdmin={isSuperAdmin}
                            isSaving={isSaving}
                            onSyncTenant={syncTenantPolicy}
                            onSyncAll={handleSyncAll}
                        />
                    )}
                    {activeTab === 'platform' && isSuperAdmin && <SystemPolicyTab />}
                    {activeTab === 'lockouts' && (
                        <LockoutsTab
                            lockoutSummary={lockoutSummary}
                            loginAttempts={loginAttempts}
                            onRefresh={() => loadLoginAttempts()}
                            isLoading={isLoading}
                        />
                    )}
                    {activeTab === 'sessions' && (
                        <TenantSessionsTab
                            sessions={tenantSessions}
                            onRefresh={loadTenantSessions}
                            onTerminate={handleTerminate}
                            isLoading={isLoading}
                        />
                    )}
                    {activeTab === 'my-sessions' && (
                        <div className="accounts-security-panel">
                            <p>Manage your own active sessions.</p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => navigate(ROUTES.SESSIONS)}
                            >
                                Open session manager
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SecurityConsole;
