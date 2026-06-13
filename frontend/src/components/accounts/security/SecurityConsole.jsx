import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FiShield, FiRefreshCw, FiAlertTriangle, FiUsers, 
    FiLock, FiMonitor, FiSettings, FiActivity
} from 'react-icons/fi';
import { useAccountsSecurity } from '../../../hooks/accounts/useAccountsSecurity';
import { useSessions } from '../../../hooks/accounts/useSessions';
import { terminateSession } from '../../../store/accounts/slice/sessionSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { ROUTES } from '../../../config/constants';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import SystemPolicyTab from './SystemPolicyTab';

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

    const { terminateSession: terminateUserSession } = useSessions();

    if (!canAccessConsole) {
        return (
            <div className="security-console">
                <div className="security-panel">
                    <FiAlertTriangle size={48} />
                    <h2>Access Denied</h2>
                    <p>Security console requires Client Admin or Super Admin role.</p>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => navigate(ROUTES.SETTINGS)}
                    >
                        Back to Settings
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
                message: res?.data?.message || 'Tenants synced successfully',
            }));
            refreshAll();
        } catch (err) {
            dispatch(showAlert({ 
                type: 'error', 
                message: err?.response?.data?.error || 'Sync failed' 
            }));
        }
    };

    const handleTerminateSession = async (sessionId) => {
        try {
            await dispatch(terminateSession(sessionId)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Session revoked successfully' }));
            loadTenantSessions();
        } catch (err) {
            dispatch(showAlert({ 
                type: 'error', 
                message: err?.message || 'Failed to revoke session' 
            }));
        }
    };

    const tabs = [
        { 
            key: 'policy', 
            label: 'Tenant Policy', 
            icon: <FiShield size={16} />,
            description: 'View and manage tenant security policy'
        },
        ...(isSuperAdmin ? [{ 
            key: 'platform', 
            label: 'Platform Policy', 
            icon: <FiSettings size={16} />,
            description: 'Configure global platform defaults'
        }] : []),
        { 
            key: 'lockouts', 
            label: 'Lockouts', 
            icon: <FiLock size={16} />,
            description: 'Monitor failed login attempts and account lockouts'
        },
        { 
            key: 'sessions', 
            label: 'Active Sessions', 
            icon: <FiMonitor size={16} />,
            description: 'View and terminate active user sessions'
        },
        { 
            key: 'activity', 
            label: 'Security Activity', 
            icon: <FiActivity size={16} />,
            description: 'Recent security events and alerts'
        },
    ];

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'critical':
                return <span className="badge-critical">CRITICAL</span>;
            case 'error':
                return <span className="badge-error">ERROR</span>;
            case 'warning':
                return <span className="badge-warning">WARNING</span>;
            default:
                return <span className="badge-info">INFO</span>;
        }
    };

    const getLockoutStatusBadge = (result) => {
        if (result === 'failure') {
            return <span className="badge-failure">FAILED</span>;
        }
        if (result === 'locked') {
            return <span className="badge-locked">LOCKED</span>;
        }
        return <span className="badge-success">SUCCESS</span>;
    };

    const PolicyTab = () => {
        const p = policy?.policy || {};

        return (
            <div className="security-panel">
                <div className="panel-header">
                    <h3>Security Policy</h3>
                    <p className="policy-version">
                        Policy version {policy?.policy_version || 1} — 
                        Effective for tenant <code>{policy?.client_id}</code>
                    </p>
                </div>

                <div className="policy-grid">
                    <div className="policy-card">
                        <h4><FiLock /> Account Lockout</h4>
                        <ul>
                            <li>
                                <strong>Failure Limit:</strong> {p.lockout?.failure_limit ?? 5} attempts
                            </li>
                            <li>
                                <strong>Lockout Duration:</strong> {p.lockout?.lockout_minutes ?? 15} minutes
                            </li>
                            <li>
                                <strong>IP Failure Limit:</strong> {p.lockout?.ip_failure_limit ?? 5}
                            </li>
                        </ul>
                    </div>

                    <div className="policy-card">
                        <h4><FiShield /> MFA Requirements</h4>
                        <ul>
                            <li>
                                <strong>Required Roles:</strong>{' '}
                                {p.mfa?.required_roles?.length > 0 
                                    ? p.mfa.required_roles.join(', ') 
                                    : 'None'}
                            </li>
                        </ul>
                    </div>

                    <div className="policy-card">
                        <h4><FiMonitor /> Session Management</h4>
                        <ul>
                            <li>
                                <strong>Max Concurrent:</strong> {p.sessions?.max_concurrent_sessions ?? 5}
                            </li>
                            <li>
                                <strong>Session Timeout:</strong> {p.sessions?.default_timeout_minutes ?? 480} minutes
                            </li>
                            <li>
                                <strong>Retention:</strong> {p.sessions?.retention_days ?? 90} days
                            </li>
                        </ul>
                    </div>

                    <div className="policy-card">
                        <h4><FiSettings /> Password & Audit</h4>
                        <ul>
                            <li>
                                <strong>Password Expiry:</strong> {p.password?.expiry_days ?? 90} days
                            </li>
                            <li>
                                <strong>Audit Retention:</strong> {p.audit?.retention_days ?? 365} days
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="policy-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={syncTenantPolicy} 
                        disabled={isSaving}
                    >
                        <FiRefreshCw size={14} /> Sync from Platform Defaults
                    </button>
                    {isSuperAdmin && (
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={handleSyncAll} 
                            disabled={isSaving}
                        >
                            <FiRefreshCw size={14} /> Sync All Tenants
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const LockoutsTab = () => {
        const attempts = loginAttempts || [];

        return (
            <div className="security-panel">
                <div className="panel-header">
                    <h3>Lockout Summary</h3>
                    <div className="lockout-stats">
                        <div className="stat">
                            <span className="stat-label">Failures (15m)</span>
                            <span className="stat-value">{lockoutSummary?.failures_last_15m ?? 0}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Locked (24h)</span>
                            <span className="stat-value">{lockoutSummary?.locked_attempts_last_24h ?? 0}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Unique IPs</span>
                            <span className="stat-value">{lockoutSummary?.unique_ips_with_failures ?? 0}</span>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="security-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Identifier</th>
                                <th>Result</th>
                                <th>Reason</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-row">
                                        No login attempts in the selected window
                                    </td>
                                </tr>
                            ) : (
                                attempts.map((attempt) => (
                                    <tr key={attempt.id}>
                                        <td>{new Date(attempt.attempted_at).toLocaleString()}</td>
                                        <td>{attempt.identifier}</td>
                                        <td>{getLockoutStatusBadge(attempt.result)}</td>
                                        <td>{attempt.failure_reason || '—'}</td>
                                        <td><code>{attempt.ip_address}</code></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="panel-footer">
                    <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => loadLoginAttempts()}
                        disabled={isLoading}
                    >
                        <FiRefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>
        );
    };

    const SessionsTab = () => {
        const sessions = tenantSessions || [];

        return (
            <div className="security-panel">
                <div className="panel-header">
                    <h3>Active Tenant Sessions</h3>
                    <span className="session-count">{sessions.length} active session(s)</span>
                </div>

                <div className="table-container">
                    <table className="security-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Device</th>
                                <th>IP Address</th>
                                <th>Last Activity</th>
                                <th>MFA Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="empty-row">
                                        No active sessions found
                                    </td>
                                </tr>
                            ) : (
                                sessions.map((session) => (
                                    <tr key={session.id}>
                                        <td>
                                            <div className="user-cell">
                                                <span className="user-avatar">
                                                    {session.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                                <span>{session.user?.email || session.user_email || '—'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {[session.browser, session.os, session.device_type]
                                                .filter(Boolean)
                                                .join(' / ') || '—'}
                                        </td>
                                        <td><code>{session.ip_address}</code></td>
                                        <td>
                                            {session.last_activity 
                                                ? new Date(session.last_activity).toLocaleString() 
                                                : '—'}
                                        </td>
                                        <td>
                                            {session.mfa_verified ? (
                                                <span className="badge-success">Verified</span>
                                            ) : (
                                                <span className="badge-warning">Not Verified</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn-danger-sm"
                                                onClick={() => handleTerminateSession(session.id)}
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

                <div className="panel-footer">
                    <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        onClick={loadTenantSessions}
                        disabled={isLoading}
                    >
                        <FiRefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>
        );
    };

    const ActivityTab = () => {
        const events = loginAttempts?.slice(0, 20) || [];

        return (
            <div className="security-panel">
                <div className="panel-header">
                    <h3>Recent Security Events</h3>
                </div>

                <div className="activity-timeline">
                    {events.length === 0 ? (
                        <div className="empty-state">
                            <FiActivity size={32} />
                            <p>No security events found</p>
                        </div>
                    ) : (
                        events.map((event, index) => (
                            <div key={event.id || index} className="activity-item">
                                <div className="activity-icon">
                                    {event.result === 'failure' ? (
                                        <FiAlertTriangle className="icon-danger" />
                                    ) : (
                                        <FiShield className="icon-info" />
                                    )}
                                </div>
                                <div className="activity-details">
                                    <div className="activity-title">
                                        <strong>{event.identifier}</strong>
                                        {getSeverityBadge(event.severity || 'info')}
                                    </div>
                                    <div className="activity-meta">
                                        <span className="activity-time">
                                            {new Date(event.attempted_at).toLocaleString()}
                                        </span>
                                        <span className="activity-ip">
                                            IP: {event.ip_address}
                                        </span>
                                    </div>
                                    {event.failure_reason && (
                                        <div className="activity-reason">
                                            Reason: {event.failure_reason}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (isLoading && !policy) {
            return <SkeletonLoader type="card" count={2} />;
        }

        if (error) {
            return (
                <div className="security-panel error">
                    <FiAlertTriangle size={24} />
                    <p>{error}</p>
                    <button className="btn btn-secondary" onClick={refreshAll}>
                        Retry
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case 'policy':
                return <PolicyTab />;
            case 'platform':
                return <SystemPolicyTab />;
            case 'lockouts':
                return <LockoutsTab />;
            case 'sessions':
                return <SessionsTab />;
            case 'activity':
                return <ActivityTab />;
            default:
                return <PolicyTab />;
        }
    };

    return (
        <div className="security-console">
            {/* Header */}
            <div className="console-header">
                <div className="header-title">
                    <FiShield className="header-icon" />
                    <div>
                        <h1>Security Console</h1>
                        <p>Monitor and manage security policies, lockouts, and sessions</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button 
                        type="button" 
                        className="btn-icon" 
                        onClick={refreshAll} 
                        disabled={isLoading}
                        title="Refresh all data"
                    >
                        <FiRefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="console-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`console-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="console-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default SecurityConsole;