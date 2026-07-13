// components/tenant/dashboard/SuperAdminDashboard.jsx
import React, { useEffect } from 'react';
import { FiUsers, FiClock, FiXCircle, FiDatabase, FiGlobe } from 'react-icons/fi';
import { MdBusiness } from 'react-icons/md';
import { useSuperAdminDashboard } from '../../../hooks/tenant';
import StatsCard from './StatsCard';
import GrowthChart from './GrowthChart';
import RecentOrganizations from './RecentOrganizations';
import SystemHealth from './SystemHealth';

const SuperAdminDashboard = () => {
  const {
    dashboard,
    loading,
    error,
    fetchDashboard,
    clearAllErrors,
  } = useSuperAdminDashboard({ autoFetch: true, refreshInterval: 120000 });

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboard) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading dashboard</p>
          <p className="dashboard-text-sm dashboard-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="dashboard-btn dashboard-btn-primary dashboard-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  const orgStats = dashboard?.organizations || {};
  const domainStats = dashboard?.domains || {};
  const resourceStats = dashboard?.resources || {};
  const recentOrgs = dashboard?.recent_organizations || [];
  const systemHealth = dashboard?.system_health || {};

  const growthData = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 180 },
    { label: 'Mar', value: 250 },
    { label: 'Apr', value: 320 },
    { label: 'May', value: 380 },
    { label: 'Jun', value: 450 },
    { label: 'Jul', value: 520 },
    { label: 'Aug', value: 580 },
    { label: 'Sep', value: 620 },
    { label: 'Oct', value: 700 },
    { label: 'Nov', value: 780 },
    { label: 'Dec', value: 850 },
  ];

  const domainChartData = [
    { label: 'Active', value: domainStats.active || 0, color: '#22c55e' },
    { label: 'Pending', value: domainStats.pending || 0, color: '#f59e0b' },
    { label: 'Failed', value: domainStats.failed || 0, color: '#ef4444' },
    { label: 'Expiring', value: domainStats.expiring_soon || 0, color: '#f97316' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Super Admin Dashboard</h1>
          <p className="dashboard-subtitle">Overview of all organizations and system status</p>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-cols-4 dashboard-mb-6">
        <StatsCard
          title="Total Organizations"
          value={orgStats.total || 0}
          change={12.5}
          icon={MdBusiness}
          color="blue"
        />
        <StatsCard
          title="Active Organizations"
          value={orgStats.active || 0}
          change={8.3}
          icon={FiUsers}
          color="green"
        />
        <StatsCard
          title="Pending Onboarding"
          value={orgStats.pending || 0}
          change={-5.2}
          icon={FiClock}
          color="orange"
        />
        <StatsCard
          title="Suspended"
          value={orgStats.suspended || 0}
          change={2.1}
          icon={FiXCircle}
          color="red"
        />
      </div>

      <div className="dashboard-grid dashboard-grid-cols-2 dashboard-mb-6">
        <GrowthChart data={growthData} title="Organization Growth (Last 12 Months)" height={200} />
        <div className="dashboard-card">
          <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>Domain Statistics</h4>
          <div className="dashboard-grid dashboard-grid-cols-2 dashboard-gap-3">
            <div>
              <p className="dashboard-text-xs dashboard-text-muted">Total</p>
              <p className="dashboard-stat-value" style={{ fontSize: '20px' }}>{domainStats.total || 0}</p>
            </div>
            <div>
              <p className="dashboard-text-xs dashboard-text-muted">Active</p>
              <p className="dashboard-stat-value" style={{ fontSize: '20px', color: '#22c55e' }}>{domainStats.active || 0}</p>
            </div>
            <div>
              <p className="dashboard-text-xs dashboard-text-muted">Pending</p>
              <p className="dashboard-stat-value" style={{ fontSize: '20px', color: '#f59e0b' }}>{domainStats.pending || 0}</p>
            </div>
            <div>
              <p className="dashboard-text-xs dashboard-text-muted">Failed</p>
              <p className="dashboard-stat-value" style={{ fontSize: '20px', color: '#ef4444' }}>{domainStats.failed || 0}</p>
            </div>
          </div>
          <div className="dashboard-divider"></div>
          <div className="dashboard-flex dashboard-gap-3" style={{ flexWrap: 'wrap' }}>
            {domainChartData.map((item) => (
              <div key={item.label} className="dashboard-flex dashboard-gap-2" style={{ alignItems: 'center' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                <span className="dashboard-text-xs dashboard-text-muted">{item.label}: {item.value}</span>
              </div>
            ))}
          </div>
          {domainStats.expiring_soon > 0 && (
            <div style={{ marginTop: '8px', background: '#fef9c3', padding: '8px 12px', borderRadius: '6px' }}>
              <span className="dashboard-text-xs" style={{ color: '#854d0e' }}>
                ⚠️ {domainStats.expiring_soon} domain{domainStats.expiring_soon > 1 ? 's' : ''} expiring soon
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-cols-3 dashboard-mb-6">
        <RecentOrganizations
          organizations={recentOrgs}
          onViewAll={() => {}}
          onSelect={(id) => console.log('Select org:', id)}
        />
        <SystemHealth health={systemHealth} />
        <div className="dashboard-card">
          <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>Resource Summary</h4>
          <div className="dashboard-space-y-2">
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted">Total Users:</span>
              <span className="dashboard-font-semibold" style={{ color: '#0f172a' }}>{dashboard?.total_users || 0}</span>
            </div>
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted">Resources:</span>
              <span className="dashboard-font-semibold" style={{ color: '#0f172a' }}>{resourceStats.total || 0}</span>
            </div>
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted">Exceeded Limits:</span>
              <span className="dashboard-font-semibold" style={{ color: '#ef4444' }}>{resourceStats.exceeded || 0}</span>
            </div>
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted">Warning Level:</span>
              <span className="dashboard-font-semibold" style={{ color: '#f59e0b' }}>{resourceStats.warning || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;