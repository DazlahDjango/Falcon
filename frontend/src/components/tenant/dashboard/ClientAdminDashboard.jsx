// components/tenant/dashboard/ClientAdminDashboard.jsx
import React, { useEffect, useMemo } from 'react';
import { FiUsers, FiGlobe, FiCpu, FiActivity, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useClientAdminDashboard } from '../../../hooks/tenant';
import StatsCard from './StatsCard';
import ActivityFeed from './ActivityFeed';

const ClientAdminDashboard = () => {
  const {
    dashboard,
    loading,
    error,
    fetchDashboard,
    clearAllErrors,
  } = useClientAdminDashboard({ autoFetch: true, refreshInterval: 120000 });

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

  const organization = dashboard?.organization || {};
  const totalUsers = dashboard?.total_users || 0;
  const totalDomains = dashboard?.total_domains || 0;
  const domainStatus = dashboard?.domains_status || {};
  const resourceUsage = dashboard?.resource_usage || [];
  const recentActivity = dashboard?.recent_activity || [];

  const getResourcePercentage = (resource) => {
    if (!resource || resource.limit === 0) return 0;
    return Math.round((resource.current / resource.limit) * 100);
  };

  const getResourceColor = (percentage) => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#22c55e';
  };

  // Calculate tenant-specific metrics
  const averageResourceUtilization = useMemo(() => {
    if (resourceUsage.length === 0) return 0;
    const total = resourceUsage.reduce((sum, resource) => sum + getResourcePercentage(resource), 0);
    return Math.round(total / resourceUsage.length);
  }, [resourceUsage]);

  const activeDomainCount = domainStatus?.active || 0;
  const totalDomainCount = totalDomains || 0;
  const domainHealthPercentage = totalDomainCount > 0 ? Math.round((activeDomainCount / totalDomainCount) * 100) : 0;

  const recentActivityCount = recentActivity?.length || 0;
  const activityTrend = recentActivityCount > 0 ? Math.round((recentActivityCount / 10) * 100) : 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{organization?.name || 'Organization Dashboard'}</h1>
          <p className="dashboard-subtitle">
            {organization?.status} • {organization?.subscription_tier || 'Free'} Tier
            {organization?.is_onboarded && ' • ✅ Onboarded'}
          </p>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-cols-4 dashboard-mb-6">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          change={0}
          icon={FiUsers}
          color="blue"
        />
        <StatsCard
          title="Active Domains"
          value={totalDomains}
          change={0}
          icon={FiGlobe}
          color="green"
        />
        <StatsCard
          title="Resource Utilization"
          value={`${averageResourceUtilization}%`}
          change={0}
          icon={FiCpu}
          color="purple"
        />
        <StatsCard
          title="Recent Activity"
          value={recentActivityCount}
          change={0}
          icon={FiActivity}
          color="orange"
        />
      </div>

      <div className="dashboard-grid dashboard-grid-cols-2 dashboard-mb-6">
        <div className="dashboard-card">
          <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>Organization Health</h4>
          <div className="dashboard-space-y-4">
            {/* Domain Health */}
            <div>
              <div className="dashboard-flex-between">
                <span className="dashboard-text-sm" style={{ color: '#0f172a' }}>Domain Health</span>
                <span className="dashboard-text-sm dashboard-font-medium" style={{ color: '#22c55e' }}>{domainHealthPercentage}%</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                <div
                  style={{
                    width: `${Math.min(domainHealthPercentage, 100)}%`,
                    height: '100%',
                    background: '#22c55e',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div className="dashboard-flex-between dashboard-mt-1">
                <span className="dashboard-text-xs dashboard-text-muted">{activeDomainCount} active</span>
                <span className="dashboard-text-xs dashboard-text-muted">{totalDomainCount} total</span>
              </div>
            </div>

            {/* System Capacity */}
            <div>
              <div className="dashboard-flex-between">
                <span className="dashboard-text-sm" style={{ color: '#0f172a' }}>System Capacity</span>
                <span className="dashboard-text-sm dashboard-font-medium" style={{ color: averageResourceUtilization >= 80 ? '#f59e0b' : '#22c55e' }}>
                  {averageResourceUtilization}%
                </span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                <div
                  style={{
                    width: `${Math.min(averageResourceUtilization, 100)}%`,
                    height: '100%',
                    background: getResourceColor(averageResourceUtilization),
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div className="dashboard-flex-between dashboard-mt-1">
                <span className="dashboard-text-xs dashboard-text-muted">Avg utilization</span>
                <span className="dashboard-text-xs dashboard-text-muted">{resourceUsage.length} resources</span>
              </div>
            </div>

            {/* Activity Index */}
            <div>
              <div className="dashboard-flex-between">
                <span className="dashboard-text-sm" style={{ color: '#0f172a' }}>Organization Activity</span>
                <span className="dashboard-text-sm dashboard-font-medium" style={{ color: '#2563eb' }}>
                  {recentActivityCount} events
                </span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                <div
                  style={{
                    width: `${Math.min(activityTrend, 100)}%`,
                    height: '100%',
                    background: '#2563eb',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div className="dashboard-flex-between dashboard-mt-1">
                <span className="dashboard-text-xs dashboard-text-muted">Recent activities</span>
                <span className="dashboard-text-xs dashboard-text-muted">Last 24h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>Resource Usage</h4>
          <div className="dashboard-space-y-3">
            {resourceUsage.slice(0, 4).map((resource, index) => {
              const percentage = getResourcePercentage(resource);
              const color = getResourceColor(percentage);
              return (
                <div key={index}>
                  <div className="dashboard-flex-between">
                    <span className="dashboard-text-sm" style={{ color: '#0f172a' }}>{resource.type_display || resource.type}</span>
                    <span className="dashboard-text-sm dashboard-font-medium" style={{ color }}>{percentage}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                    <div
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <div className="dashboard-flex-between dashboard-mt-1">
                    <span className="dashboard-text-xs dashboard-text-muted">{resource.current} used</span>
                    <span className="dashboard-text-xs dashboard-text-muted">Limit: {resource.limit}</span>
                  </div>
                </div>
              );
            })}
            {resourceUsage.length === 0 && (
              <p className="dashboard-text-sm dashboard-text-muted">No resources configured</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-cols-2">
        <div className="dashboard-card">
          <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>Organization Info</h4>
          <div className="dashboard-space-y-2">
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted" style={{ minWidth: '100px' }}>Name</span>
              <span className="dashboard-text-sm" style={{ color: '#0f172a' }}>{organization?.name || 'N/A'}</span>
            </div>
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted" style={{ minWidth: '100px' }}>Tier</span>
              <span className="dashboard-text-sm" style={{ color: '#0f172a' }}>{organization?.subscription_tier || 'Free'}</span>
            </div>
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted" style={{ minWidth: '100px' }}>Status</span>
              <span className={`dashboard-badge ${organization?.status === 'ACTIVE' ? 'dashboard-badge-green' : 'dashboard-badge-yellow'}`}>
                {organization?.status || 'Unknown'}
              </span>
            </div>
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted" style={{ minWidth: '100px' }}>Domains</span>
              <span className="dashboard-text-sm" style={{ color: '#0f172a' }}>{totalDomains} ({domainStatus?.active || 0} active, {domainStatus?.pending || 0} pending)</span>
            </div>
            <div className="dashboard-flex dashboard-gap-2">
              <span className="dashboard-text-sm dashboard-text-muted" style={{ minWidth: '100px' }}>Users</span>
              <span className="dashboard-text-sm" style={{ color: '#0f172a' }}>{totalUsers}</span>
            </div>
          </div>
        </div>
        <ActivityFeed activities={recentActivity} onViewAll={() => {}} />
      </div>
    </div>
  );
};

export default ClientAdminDashboard;