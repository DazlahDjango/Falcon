import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FiShield, FiSmartphone, FiCode, FiActivity, FiUsers,
    FiSettings, FiAlertCircle, FiCheckCircle, FiClock,
    FiTrendingUp, FiShieldOff, FiUserCheck, FiBarChart2,
    FiLock, FiRefreshCw, FiChevronRight
} from 'react-icons/fi';
import { useMFA } from '../../../hooks/accounts/useMfa';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import { ROLES } from '../../../config/constants';
import MFAStatusBadge from './MFAStatusBadge';
import MFADeviceCard from './MFADeviceCard';
import MFAActivityLog from './MFAActivityLog';
import './mfa-dashboard.css';

const MFADashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useAuth();
    const {
        devices,
        status,
        isMfaEnabled,
        backupCodesRemaining,
        loadMfaStatus,
        loadDevices,
        loadActivity,
        activity,
        devicesLoading,
        statusLoading,
        setAsPrimary,
        removeDevice,
    } = useMFA();

    const {
        tenantPolicy,
        usersPolicy,
        loadTenantMFAPolicy,
        loadAllUsersMFAPolicy,
        tenantPolicyLoading,
    } = useAdminMFA();

    const [activeTab, setActiveTab] = useState('overview');
    const [recentActivity, setRecentActivity] = useState([]);
    const [complianceStats, setComplianceStats] = useState({
        total: 0,
        compliant: 0,
        nonCompliant: 0,
        complianceRate: 0,
    });

    const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.CLIENT_ADMIN;

    useEffect(() => {
        if (isAuthenticated) {
            loadMfaStatus();
            loadDevices();
            loadActivity(7);
        }
    }, [isAuthenticated, loadMfaStatus, loadDevices, loadActivity]);

    useEffect(() => {
        if (isAdmin) {
            loadTenantMFAPolicy();
            loadAllUsersMFAPolicy();
        }
    }, [isAdmin, loadTenantMFAPolicy, loadAllUsersMFAPolicy]);

    useEffect(() => {
        if (activity?.activity) {
            setRecentActivity(activity.activity.slice(0, 5));
        }
    }, [activity]);

    useEffect(() => {
        if (usersPolicy && usersPolicy.length > 0) {
            const total = usersPolicy.length;
            const compliant = usersPolicy.filter(u => {
                const requiresMFA = u.mfa_effective_required;
                return !requiresMFA || u.mfa_enabled;
            }).length;
            const nonCompliant = total - compliant;
            const complianceRate = total > 0 ? (compliant / total) * 100 : 0;

            setComplianceStats({
                total,
                compliant,
                nonCompliant,
                complianceRate: Math.round(complianceRate),
            });
        }
    }, [usersPolicy]);

    const handleRefresh = async () => {
        await loadMfaStatus();
        await loadDevices();
        await loadActivity(7);
        if (isAdmin) {
            await loadTenantMFAPolicy();
            await loadAllUsersMFAPolicy();
        }
        dispatch(showAlert({ type: 'success', message: 'Dashboard refreshed' }));
    };

    const handleRemoveDevice = async (deviceId, deviceName) => {
        if (window.confirm(`Are you sure you want to remove "${deviceName}"?`)) {
            try {
                await removeDevice(deviceId);
                await loadDevices();
                await loadMfaStatus();
                dispatch(showAlert({ type: 'success', message: `${deviceName} removed successfully` }));
            } catch (error) {
                dispatch(showAlert({ type: 'error', message: 'Failed to remove device' }));
            }
        }
    };

    const handleSetPrimary = async (deviceId) => {
        try {
            await setAsPrimary(deviceId);
            await loadDevices();
            dispatch(showAlert({ type: 'success', message: 'Primary device updated' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to set primary device' }));
        }
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const getActivityIcon = (eventType, success) => {
        if (!success) return <FiAlertCircle className="activity-icon error" />;
        if (eventType === 'enroll') return <FiShield className="activity-icon success" />;
        if (eventType === 'disable') return <FiShieldOff className="activity-icon warning" />;
        return <FiActivity className="activity-icon info" />;
    };

    if (statusLoading && devicesLoading) {
        return (
            <div className="mfa-dashboard-loading">
                <Spinner size="lg" />
                <p>Loading MFA Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="mfa-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-title">
                    <FiShield className="header-icon" />
                    <div>
                        <h1>MFA Security Center</h1>
                        <p>Manage multi-factor authentication and security settings</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleRefresh}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FiBarChart2 /> Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'devices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('devices')}
                >
                    <FiSmartphone /> My Devices
                </button>
                <button
                    className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    <FiActivity /> Activity Log
                </button>
                {isAdmin && (
                    <button
                        className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('admin')}
                    >
                        <FiUsers /> Admin Overview
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="dashboard-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        {/* Personal Status Cards */}
                        <div className="status-cards">
                            <div className={`status-card ${isMfaEnabled ? 'enabled' : 'disabled'}`}>
                                <div className="card-icon">
                                    {isMfaEnabled ? <FiShield /> : <FiShieldOff />}
                                </div>
                                <div className="card-info">
                                    <div className="card-value">{isMfaEnabled ? 'Enabled' : 'Disabled'}</div>
                                    <div className="card-label">MFA Status</div>
                                </div>
                            </div>
                            <div className="status-card">
                                <div className="card-icon"><FiSmartphone /></div>
                                <div className="card-info">
                                    <div className="card-value">{devices?.filter(d => d.is_active).length || 0}</div>
                                    <div className="card-label">Active Devices</div>
                                </div>
                            </div>
                            <div className="status-card">
                                <div className="card-icon"><FiCode /></div>
                                <div className="card-info">
                                    <div className="card-value">{backupCodesRemaining || 0}</div>
                                    <div className="card-label">Backup Codes Left</div>
                                </div>
                            </div>
                            <div className="status-card">
                                <div className="card-icon"><FiClock /></div>
                                <div className="card-info">
                                    <div className="card-value">
                                        {status?.last_used_at ? getTimeAgo(status.last_used_at) : 'Never'}
                                    </div>
                                    <div className="card-label">Last Used</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h3>Quick Actions</h3>
                            <div className="actions-grid">
                                {!isMfaEnabled ? (
                                    <button
                                        className="action-card primary"
                                        onClick={() => navigate('/security/mfa/setup')}
                                    >
                                        <FiShield className="action-icon" />
                                        <div>
                                            <strong>Enable MFA</strong>
                                            <p>Secure your account with two-factor authentication</p>
                                        </div>
                                        <FiChevronRight className="arrow" />
                                    </button>
                                ) : (
                                    <button
                                        className="action-card"
                                        onClick={() => setActiveTab('devices')}
                                    >
                                        <FiSmartphone className="action-icon" />
                                        <div>
                                            <strong>Manage Devices</strong>
                                            <p>Add or remove MFA devices</p>
                                        </div>
                                        <FiChevronRight className="arrow" />
                                    </button>
                                )}
                                <button
                                    className="action-card"
                                    onClick={() => navigate('/security/mfa/backup-codes')}
                                >
                                    <FiCode className="action-icon" />
                                    <div>
                                        <strong>Backup Codes</strong>
                                        <p>Generate new backup codes for account recovery</p>
                                    </div>
                                    <FiChevronRight className="arrow" />
                                </button>
                                <button
                                    className="action-card"
                                    onClick={() => setActiveTab('activity')}
                                >
                                    <FiActivity className="action-icon" />
                                    <div>
                                        <strong>View Activity</strong>
                                        <p>See your MFA verification history</p>
                                    </div>
                                    <FiChevronRight className="arrow" />
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity Preview */}
                        {recentActivity.length > 0 && (
                            <div className="recent-activity">
                                <h3>Recent Activity</h3>
                                <div className="activity-list">
                                    {recentActivity.map((log, index) => (
                                        <div key={index} className="activity-item">
                                            {getActivityIcon(log.event_type, log.success)}
                                            <div className="activity-details">
                                                <div className="activity-message">{log.message || log.event_type}</div>
                                                <div className="activity-meta">
                                                    <span className="activity-ip">{log.ip_address || 'Unknown IP'}</span>
                                                    <span className="activity-time">{getTimeAgo(log.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {activity?.count > 5 && (
                                    <button
                                        className="view-all-btn"
                                        onClick={() => setActiveTab('activity')}
                                    >
                                        View All Activity <FiChevronRight />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Devices Tab */}
                {activeTab === 'devices' && (
                    <div className="devices-tab">
                        <div className="devices-header">
                            <h2>My MFA Devices</h2>
                            {!isMfaEnabled && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/security/mfa/setup')}
                                >
                                    <FiShield /> Enable MFA
                                </button>
                            )}
                        </div>

                        {devices && devices.filter(d => d.is_active).length > 0 ? (
                            <div className="devices-grid">
                                {devices.filter(d => d.is_active).map((device) => (
                                    <MFADeviceCard
                                        key={device.id}
                                        device={device}
                                        onRemove={handleRemoveDevice}
                                        onSetPrimary={handleSetPrimary}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <FiSmartphone className="empty-icon" />
                                <h3>No MFA Devices</h3>
                                <p>Secure your account by setting up multi-factor authentication</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/security/mfa/setup')}
                                >
                                    Set up MFA
                                </button>
                            </div>
                        )}

                        {backupCodesRemaining > 0 && (
                            <div className="backup-info">
                                <FiCode className="info-icon" />
                                <div>
                                    <strong>{backupCodesRemaining} backup codes remaining</strong>
                                    <p>You can generate new backup codes from the Backup Codes page</p>
                                </div>
                                <button
                                    className="btn-secondary-sm"
                                    onClick={() => navigate('/security/mfa/backup-codes')}
                                >
                                    Manage
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <MFAActivityLog />
                )}

                {/* Admin Tab */}
                {activeTab === 'admin' && isAdmin && (
                    <div className="admin-tab">
                        {/* Admin Stats */}
                        <div className="admin-stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon"><FiUsers /></div>
                                <div className="stat-info">
                                    <div className="stat-value">{complianceStats.total}</div>
                                    <div className="stat-label">Total Users</div>
                                </div>
                            </div>
                            <div className="stat-card success">
                                <div className="stat-icon"><FiCheckCircle /></div>
                                <div className="stat-info">
                                    <div className="stat-value">{complianceStats.compliant}</div>
                                    <div className="stat-label">MFA Compliant</div>
                                </div>
                            </div>
                            <div className="stat-card warning">
                                <div className="stat-icon"><FiAlertCircle /></div>
                                <div className="stat-info">
                                    <div className="stat-value">{complianceStats.nonCompliant}</div>
                                    <div className="stat-label">Need MFA Setup</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><FiTrendingUp /></div>
                                <div className="stat-info">
                                    <div className="stat-value">{complianceStats.complianceRate}%</div>
                                    <div className="stat-label">Compliance Rate</div>
                                </div>
                            </div>
                        </div>

                        {/* MFA Policy Summary */}
                        <div className="policy-summary">
                            <h3>MFA Policy Summary</h3>
                            <div className="policy-badges">
                                <span className="policy-badge">
                                    <FiUserCheck /> Roles requiring MFA: {(tenantPolicy?.mfa_required_roles?.length || 0)}
                                </span>
                                <span className="policy-badge">
                                    <FiShield /> Policy Version: {tenantPolicy?.policy_version || 1}
                                </span>
                            </div>
                            {tenantPolicy?.mfa_required_roles?.length > 0 && (
                                <div className="required-roles">
                                    <strong>Roles requiring MFA:</strong>
                                    <div className="roles-list">
                                        {tenantPolicy.mfa_required_roles.map((role) => (
                                            <span key={role} className="role-tag">{role}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Admin Actions */}
                        <div className="admin-actions-grid">
                            <button
                                className="admin-action-card"
                                onClick={() => navigate('/security/mfa/policy')}
                            >
                                <FiSettings />
                                <div>
                                    <strong>MFA Policy</strong>
                                    <p>Configure role-based MFA requirements</p>
                                </div>
                            </button>
                            <button
                                className="admin-action-card"
                                onClick={() => navigate('/security/mfa/users')}
                            >
                                <FiUsers />
                                <div>
                                    <strong>User MFA Policy</strong>
                                    <p>Manage MFA requirements for individual users</p>
                                </div>
                            </button>
                            <button
                                className="admin-action-card"
                                onClick={() => navigate('/admin/mfa/users')}
                            >
                                <FiShield />
                                <div>
                                    <strong>MFA Reset</strong>
                                    <p>Reset MFA for users who lost access</p>
                                </div>
                            </button>
                        </div>

                        {/* Non-Compliant Users Preview */}
                        {complianceStats.nonCompliant > 0 && (
                            <div className="non-compliant-preview">
                                <h3>Users Needing MFA Setup</h3>
                                <div className="user-list">
                                    {usersPolicy?.filter(u => u.mfa_effective_required && !u.mfa_enabled).slice(0, 5).map((user) => (
                                        <div key={user.id} className="user-item">
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {user.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="user-name">{user.email}</div>
                                                    <div className="user-role">{user.role}</div>
                                                </div>
                                            </div>
                                            <FiAlertCircle className="warning-icon" />
                                        </div>
                                    ))}
                                </div>
                                {complianceStats.nonCompliant > 5 && (
                                    <button
                                        className="view-all-btn"
                                        onClick={() => navigate('/security/mfa/users')}
                                    >
                                        View all {complianceStats.nonCompliant} users
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MFADashboard;