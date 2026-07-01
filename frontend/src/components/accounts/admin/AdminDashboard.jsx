import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiShield,
  FiBriefcase,
  FiServer,
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiUserCheck,
  FiUserX,
  FiShieldOff,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
} from 'react-icons/fi';
import { useAdmin } from '../../../hooks/accounts/useAdmin';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const {
    getUserStats,
    getTenantStats,
    getSystemInfo,
    getSystemHealth,
    userStats,
    tenantStats,
    systemInfo,
    systemHealth,
    isLoading,
    error,
    clearError,
  } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getUserStats(),
        getTenantStats(),
        getSystemInfo(),
        getSystemHealth(),
      ]);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboard();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !userStats && !tenantStats) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-title">
          <FiServer className="title-icon" />
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-dashboard-actions">
          <button className="btn-icon" onClick={handleRefresh} disabled={refreshing}>
            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-dashboard-error">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <div className="admin-dashboard-stats">
        <div className="stat-card" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_USERS)}>
          <div className="stat-icon users">
            <FiUsers />
          </div>
          <div className="stat-info">
            <span className="stat-value">{userStats?.total_users || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-change positive">
            <FiTrendingUp /> {userStats?.active_users || 0} active
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_TENANTS)}>
          <div className="stat-icon tenants">
            <FiBriefcase />
          </div>
          <div className="stat-info">
            <span className="stat-value">{tenantStats?.total_tenants || 0}</span>
            <span className="stat-label">Total Tenants</span>
          </div>
          <div className="stat-change positive">
            <FiTrendingUp /> {tenantStats?.active_tenants || 0} active
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_ROLES)}>
          <div className="stat-icon roles">
            <FiShield />
          </div>
          <div className="stat-info">
            <span className="stat-value">{userStats?.users_by_role ? Object.keys(userStats.users_by_role).length : 0}</span>
            <span className="stat-label">Roles</span>
          </div>
          <div className="stat-change">
            <FiBarChart2 /> {Object.values(userStats?.users_by_role || {}).reduce((a, b) => a + b, 0)} assigned
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_SYSTEM)}>
          <div className="stat-icon system">
            <FiServer />
          </div>
          <div className="stat-info">
            <span className="stat-value">{systemHealth?.status === 'healthy' ? '✅' : '⚠️'}</span>
            <span className="stat-label">System Status</span>
          </div>
          <div className={`stat-change ${systemHealth?.status === 'healthy' ? 'positive' : 'negative'}`}>
            {systemHealth?.status || 'Unknown'}
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="dashboard-card users-card">
          <div className="card-header">
            <h3>User Statistics</h3>
            <button className="btn-secondary-sm" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_USERS)}>
              View All
            </button>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{userStats?.total_users || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Active Users</span>
              <span className="stat-value">{userStats?.active_users || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Verified Users</span>
              <span className="stat-value">{userStats?.verified_users || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">MFA Enabled</span>
              <span className="stat-value">{userStats?.mfa_enabled_users || 0}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card roles-card">
          <div className="card-header">
            <h3>Users by Role</h3>
          </div>
          <div className="card-content">
            {userStats?.users_by_role && Object.entries(userStats.users_by_role).map(([role, count]) => (
              <div key={role} className="stat-row">
                <span className="stat-label">{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                <span className="stat-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card tenants-card">
          <div className="card-header">
            <h3>Tenant Statistics</h3>
            <button className="btn-secondary-sm" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_TENANTS)}>
              View All
            </button>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label">Total Tenants</span>
              <span className="stat-value">{tenantStats?.total_tenants || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Active Tenants</span>
              <span className="stat-value">{tenantStats?.active_tenants || 0}</span>
            </div>
            {tenantStats?.tenants_by_plan && Object.entries(tenantStats.tenants_by_plan).map(([plan, count]) => (
              <div key={plan} className="stat-row">
                <span className="stat-label">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
                <span className="stat-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card system-card">
          <div className="card-header">
            <h3>System Information</h3>
            <button className="btn-secondary-sm" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_SYSTEM)}>
              View Details
            </button>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label">Environment</span>
              <span className="stat-value">{systemInfo?.system?.environment || 'Unknown'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Version</span>
              <span className="stat-value">{systemInfo?.system?.version || '1.0.0'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Database</span>
              <span className="stat-value">{systemInfo?.database?.status || 'Unknown'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Cache</span>
              <span className="stat-value">{systemInfo?.cache?.status || 'Unknown'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Last Updated</span>
              <span className="stat-value">{formatDate(systemInfo?.system?.time)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-actions-grid">
        {isSuperAdmin && (
          <>
            <button className="action-card" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_SYSTEM)}>
              <FiServer className="action-icon" />
              <span>System Settings</span>
            </button>
            <button className="action-card" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_MFA)}>
              <FiShield className="action-icon" />
              <span>MFA Management</span>
            </button>
            <button className="action-card" onClick={() => navigate(ACCOUNTS_ROUTES.SECURITY_LOGIN_ATTEMPTS)}>
              <FiActivity className="action-icon" />
              <span>Security Logs</span>
            </button>
            <button className="action-card" onClick={() => navigate(ACCOUNTS_ROUTES.AUDIT_LOGS)}>
              <FiAlertCircle className="action-icon" />
              <span>Audit Logs</span>
            </button>
          </>
        )}
        <button className="action-card" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_USERS)}>
          <FiUsers className="action-icon" />
          <span>Manage Users</span>
        </button>
        <button className="action-card" onClick={() => navigate(ACCOUNTS_ROUTES.ADMIN_ROLES)}>
          <FiShield className="action-icon" />
          <span>Manage Roles</span>
        </button>
      </div>
    </div>
  );
};
export default AdminDashboard;