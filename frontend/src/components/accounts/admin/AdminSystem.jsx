import React, { useState, useEffect } from 'react';
import {
    FiServer, FiActivity, FiDatabase, FiRefreshCw,
    FiCheckCircle, FiXCircle, FiAlertCircle, FiClock,
    FiBarChart2, FiUsers, FiShield, FiTrash2
} from 'react-icons/fi';
import { useAdmin } from '../../../hooks/accounts/useAdmin';
import Spinner from '../../common/UI/Spinner';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';

const AdminSystem = () => {
    const {
        stats,
        health,
        systemConfig,
        isLoading,
        loadSystemStats,
        loadSystemHealth,
        loadSystemConfig,
        clearSystemCache,
        clearAdminError,
    } = useAdmin();

    const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
    const [isClearingCache, setIsClearingCache] = useState(false);

    useEffect(() => {
        loadSystemStats();
        loadSystemHealth();
        loadSystemConfig();
    }, [loadSystemStats, loadSystemHealth, loadSystemConfig]);

    const handleClearCache = async () => {
        setIsClearingCache(true);
        try {
            await clearSystemCache();
            setShowClearCacheConfirm(false);
        } finally {
            setIsClearingCache(false);
        }
    };

    const getHealthStatus = () => {
        if (!health) return { status: 'unknown', color: '#6b7280', icon: <FiAlertCircle /> };
        if (health.status === 'healthy') return { status: 'Healthy', color: '#10b981', icon: <FiCheckCircle /> };
        if (health.status === 'degraded') return { status: 'Degraded', color: '#f59e0b', icon: <FiAlertCircle /> };
        return { status: 'Unhealthy', color: '#dc2626', icon: <FiXCircle /> };
    };

    const healthStatus = getHealthStatus();

    if (isLoading && !stats.total_users) {
        return (
            <div className="admin-loading">
                <Spinner size="lg" />
                <p>Loading system information...</p>
            </div>
        );
    }

    return (
        <div className="admin-system-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>System Dashboard</h1>
                    <p>Monitor system health and performance</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => setShowClearCacheConfirm(true)}
                    disabled={isClearingCache}
                >
                    <FiTrash2 size={16} />
                    {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                </button>
            </div>

            {/* System Stats */}
            <div className="admin-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><FiUsers size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total_users?.toLocaleString() || 0}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon"><FiActivity size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.active_users?.toLocaleString() || 0}</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiDatabase size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total_tenants?.toLocaleString() || 0}</div>
                        <div className="stat-label">Total Tenants</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiBarChart2 size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.api_requests?.toLocaleString() || 0}</div>
                        <div className="stat-label">API Requests</div>
                    </div>
                </div>
            </div>

            {/* Health Status */}
            <div className="system-section">
                <h2>System Health</h2>
                <div className="health-status" style={{ borderLeftColor: healthStatus.color }}>
                    <div className="health-icon" style={{ color: healthStatus.color }}>
                        {healthStatus.icon}
                    </div>
                    <div className="health-info">
                        <div className="health-status-label">Status</div>
                        <div className="health-status-value">{healthStatus.status}</div>
                    </div>
                    <div className="health-info">
                        <div className="health-status-label">Uptime</div>
                        <div className="health-status-value">{stats.uptime || '—'}</div>
                    </div>
                    <div className="health-info">
                        <div className="health-status-label">Last Check</div>
                        <div className="health-status-value">
                            {health?.last_check ? new Date(health.last_check).toLocaleString() : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Status */}
            <div className="system-section">
                <h2>Service Status</h2>
                <div className="services-grid">
                    <div className="service-card">
                        <div className="service-icon"><FiServer size={24} /></div>
                        <div className="service-info">
                            <div className="service-name">Database</div>
                            <div className={`service-status ${health?.database === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                                {health?.database === 'healthy' ? 'Operational' : 'Issues Detected'}
                            </div>
                        </div>
                    </div>
                    <div className="service-card">
                        <div className="service-icon"><FiRefreshCw size={24} /></div>
                        <div className="service-info">
                            <div className="service-name">Redis Cache</div>
                            <div className={`service-status ${health?.redis === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                                {health?.redis === 'healthy' ? 'Operational' : 'Issues Detected'}
                            </div>
                        </div>
                    </div>
                    <div className="service-card">
                        <div className="service-icon"><FiShield size={24} /></div>
                        <div className="service-info">
                            <div className="service-name">Authentication</div>
                            <div className={`service-status ${health?.auth === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                                {health?.auth === 'healthy' ? 'Operational' : 'Issues Detected'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Configuration */}
            {systemConfig && (
                <div className="system-section">
                    <h2>System Configuration</h2>
                    <div className="config-grid">
                        <div className="config-item">
                            <span className="config-label">Version</span>
                            <span className="config-value">{systemConfig.version || '1.0.0'}</span>
                        </div>
                        <div className="config-item">
                            <span className="config-label">Environment</span>
                            <span className="config-value">{systemConfig.environment || 'production'}</span>
                        </div>
                        <div className="config-item">
                            <span className="config-label">Debug Mode</span>
                            <span className="config-value">{systemConfig.debug ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="config-item">
                            <span className="config-label">API Rate Limit</span>
                            <span className="config-value">{systemConfig.api_rate_limit || 100}/min</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear Cache Confirmation */}
            <ConfirmationDialog
                isOpen={showClearCacheConfirm}
                onClose={() => setShowClearCacheConfirm(false)}
                onConfirm={handleClearCache}
                type="warning"
                title="Clear System Cache"
                message="Clearing the cache will temporarily affect performance while it rebuilds. Are you sure you want to proceed?"
                confirmText="Clear Cache"
            />
        </div>
    );
};

export default AdminSystem;