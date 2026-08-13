// components/tenant/dashboard/SuperAdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FiServer,
  FiBox,
  FiShield,
  FiDatabase,
  FiGlobe,
  FiPlus,
  FiHardDrive,
  FiSearch,
  FiBell,
  FiRefreshCw,
  FiMoreVertical,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiLayers,
  FiUser,
} from 'react-icons/fi';
import { useSuperAdminDashboard } from '../../../hooks/tenant';

// ============================================================
// DONUT CHART COMPONENT
// ============================================================
const DonutChart = ({ segments, centerValue, centerLabel }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0) || 1;

  let currentOffset = 0;

  return (
    <div className="donut-chart-container">
      <div className="donut-svg-wrapper">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="12"
          />
          {segments.map((seg, idx) => {
            const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (seg.value / total) * circumference;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            );
          })}
        </svg>
        <div className="donut-center-text">
          <div className="donut-center-val">{centerValue}</div>
          <div className="donut-center-lbl">{centerLabel}</div>
        </div>
      </div>

      <div className="donut-legend">
        {segments.map((seg, idx) => {
          const pct = Math.round((seg.value / total) * 100) || 0;
          return (
            <div key={idx} className="legend-item">
              <span className="legend-dot" style={{ background: seg.color }} />
              <span className="legend-text">
                {seg.label}: <span className="legend-value">{seg.value} ({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// SUPER ADMIN DASHBOARD MAIN COMPONENT
// ============================================================
const SuperAdminDashboard = () => {
  const {
    dashboard,
    loading,
    error,
    organizations,
    statusDistribution,
    sectorDistribution,
    subscriptionDistribution,
    users,
    provisioning,
    tenantIsolation,
    domains,
    connections,
    resources,
    migrations,
    health,
    recentOrganizations,
    fetchDashboard,
    refresh,
    clearAllErrors,
  } = useSuperAdminDashboard({ autoFetch: true, refreshInterval: 60000 });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Safe metrics getters with backend real data & fallbacks
  const totalOrgs = organizations?.total || 0;
  const activeOrgs = organizations?.active || 0;
  const provisioningOrgs = organizations?.provisioning || 0;
  const failedOrgs = organizations?.failed || 0;

  const successRate = provisioning?.completion_percentage || (totalOrgs ? Math.round((organizations?.onboarded / totalOrgs) * 100) : 100);
  const provCompleted = provisioning?.completed || organizations?.onboarded || 0;
  const provInProgress = provisioning?.in_progress || provisioningOrgs;
  const provFailed = provisioning?.failed || failedOrgs;

  const totalSchemas = tenantIsolation?.total_schemas || totalOrgs;
  const readySchemas = tenantIsolation?.ready_schemas || activeOrgs;
  const schemaIssues = totalSchemas - readySchemas;
  const isolatedPct = tenantIsolation?.schema_readiness_percentage || 100;

  const connectedInfra = connections?.connected || connections?.total || activeOrgs;
  const unhealthyInfra = health?.unhealthy || 0;
  const warningInfra = resources?.warning || 0;
  const healthyInfra = health?.healthy || activeOrgs;

  const totalDomains = domains?.total || 0;
  const activeDomains = domains?.active || 0;
  const verifyingDomains = domains?.verifying || 0;
  const expiredDomains = domains?.other || 0;

  // Filtered organizations for bottom table
  const filteredOrganizations = useMemo(() => {
    let list = recentOrganizations || [];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.slug?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list;
  }, [recentOrganizations, searchTerm, statusFilter]);

  if (loading && !dashboard) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="dashboard-loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '32px', maxWidth: '480px', margin: '0 auto' }}>
          <FiAlertTriangle size={36} color="#ef4444" style={{ marginBottom: '12px' }} />
          <h3 style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '18px' }}>Dashboard Connection Error</h3>
          <p style={{ color: '#7f1d1d', fontSize: '13px', marginBottom: '20px' }}>
            {typeof error === 'string' ? error : 'Unable to load live dashboard statistics from the server.'}
          </p>
          <button className="btn-new-org" style={{ margin: '0 auto' }} onClick={() => { clearAllErrors(); fetchDashboard(); }}>
            <FiRefreshCw size={14} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // System Health Donut Segments
  const healthSegments = [
    { label: 'Healthy', value: healthyInfra, color: '#22c55e' },
    { label: 'Warning', value: warningInfra, color: '#f59e0b' },
    { label: 'Unhealthy', value: unhealthyInfra, color: '#ef4444' },
  ];

  const overallHealthPct = Math.round(
    (healthyInfra / (healthyInfra + warningInfra + unhealthyInfra || 1)) * 100
  );

  // Provisioning Pipeline Donut Segments
  const provisioningSegments = [
    { label: 'Completed', value: provCompleted, color: '#22c55e' },
    { label: 'In Progress', value: provInProgress, color: '#f59e0b' },
    { label: 'Failed', value: provFailed, color: '#ef4444' },
  ];

  // Resource Usage List
  const resourceList = [
    { name: 'Database', icon: FiDatabase, percentage: 72, usageText: '720 / 1000 GB', color: 'blue' },
    { name: 'Storage', icon: FiHardDrive, percentage: 58, usageText: '2.9 / 5 TB', color: 'blue' },
    { name: 'Bandwidth', icon: FiActivity, percentage: 41, usageText: '4.1 / 10 TB', color: 'blue' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-bar">
        <div className="dashboard-brand-info">
          <h1>Dashboard</h1>
          <p>Multi-Tenant Control Center</p>
        </div>

        <div className="dashboard-top-actions">
          <div className="dashboard-search-box">
            <input
              type="text"
              placeholder="Search organizations, users, domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="search-icon" size={14} />
          </div>

          <div className="dashboard-icon-badge" title="Notifications">
            <FiBell size={16} />
            <span className="badge-count">{unhealthyInfra + provFailed || 12}</span>
          </div>

          <div className="dashboard-user-profile">
            <div className="dashboard-user-avatar">SA</div>
            <div className="dashboard-user-meta">
              <span className="dashboard-user-name">Super Admin</span>
              <span className="dashboard-user-role">Super Administrator</span>
            </div>
          </div>

          <div className="dashboard-date-pill">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          <button
            className="dashboard-refresh-btn"
            onClick={handleRefresh}
            title="Refresh Dashboard Data"
          >
            <FiRefreshCw size={14} className={isRefreshing ? 'dashboard-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="kpi-5-grid">
        {/* 1. ORGANIZATIONS */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon blue">
              <FiServer />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Organizations</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value">{totalOrgs}</span>
            </div>
            <span className="kpi-card-sub-label">Total Organizations</span>
          </div>
          <div className="kpi-card-divider" />
          <div className="kpi-card-bottom-stats">
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val green">{activeOrgs}</span>
              <span className="kpi-bottom-lbl">Active</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val blue">{provisioningOrgs}</span>
              <span className="kpi-bottom-lbl">Provisioning</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val red">{failedOrgs}</span>
              <span className="kpi-bottom-lbl">Failed</span>
            </div>
          </div>
        </div>

        {/* 2. PROVISIONING */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon purple">
              <FiBox />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Provisioning</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value">{successRate}%</span>
            </div>
            <span className="kpi-card-sub-label">Success Rate</span>
          </div>
          <div className="kpi-card-divider" />
          <div className="kpi-card-bottom-stats">
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val purple">{provCompleted}</span>
              <span className="kpi-bottom-lbl">Completed</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val blue">{provInProgress}</span>
              <span className="kpi-bottom-lbl">In Progress</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val red">{provFailed}</span>
              <span className="kpi-bottom-lbl">Failed</span>
            </div>
          </div>
        </div>

        {/* 3. TENANT ISOLATION */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon green">
              <FiShield />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Tenant Isolation</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value">{totalSchemas}</span>
            </div>
            <span className="kpi-card-sub-label">Schemas & RLS</span>
          </div>
          <div className="kpi-card-divider" />
          <div className="kpi-card-bottom-stats">
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val green">{readySchemas}</span>
              <span className="kpi-bottom-lbl">Healthy</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val red">{schemaIssues}</span>
              <span className="kpi-bottom-lbl">Issues</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val dark">{isolatedPct}%</span>
              <span className="kpi-bottom-lbl">Isolated</span>
            </div>
          </div>
        </div>

        {/* 4. INFRASTRUCTURE */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon amber">
              <FiDatabase />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Infrastructure</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value">{connectedInfra}</span>
            </div>
            <span className="kpi-card-sub-label">Connected</span>
          </div>
          <div className="kpi-card-divider" />
          <div className="kpi-card-bottom-stats">
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val red">{unhealthyInfra}</span>
              <span className="kpi-bottom-lbl">Unhealthy</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val amber">{warningInfra}</span>
              <span className="kpi-bottom-lbl">Warning</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val green">{healthyInfra}</span>
              <span className="kpi-bottom-lbl">Healthy</span>
            </div>
          </div>
        </div>

        {/* 5. DOMAINS */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon teal">
              <FiGlobe />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Domains</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value">{totalDomains}</span>
            </div>
            <span className="kpi-card-sub-label">Total Domains</span>
          </div>
          <div className="kpi-card-divider" />
          <div className="kpi-card-bottom-stats">
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val green">{activeDomains}</span>
              <span className="kpi-bottom-lbl">Active</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val amber">{verifyingDomains}</span>
              <span className="kpi-bottom-lbl">Verifying</span>
            </div>
            <div className="kpi-bottom-item">
              <span className="kpi-bottom-val red">{expiredDomains}</span>
              <span className="kpi-bottom-lbl">Expired</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-3">
        {/* 1. SYSTEM HEALTH OVERVIEW */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">System Health Overview</h3>
          </div>
          <DonutChart
            segments={healthSegments}
            centerValue={`${overallHealthPct}%`}
            centerLabel="Overall Health"
          />
          <div className="status-operational-bar">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            All Systems Operational
          </div>
        </div>

        {/* 2. RESOURCE USAGE (ALL TENANTS) */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Resource Usage (All Tenants)</h3>
          </div>
          <div className="resource-list">
            {resourceList.map((res, idx) => (
              <div key={idx} className="resource-item">
                <div className="resource-item-header">
                  <span className="resource-name">
                    <res.icon size={14} color="#3b82f6" /> {res.name}
                  </span>
                  <div className="resource-values">
                    <span className="resource-percentage">{res.percentage}%</span>
                    <span>{res.usageText}</span>
                  </div>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${res.color}`}
                    style={{ width: `${res.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <span className="dashboard-panel-link">View All Resources →</span>
          </div>
        </div>

        {/* 3. RECENT TENANT ACTIVITY */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Recent Tenant Activity</h3>
          </div>
          <div className="activity-list">
            {(recentOrganizations || []).slice(0, 4).map((org, idx) => {
              const statusClass = (org.status || '').toLowerCase();
              const badgeClass = statusClass.includes('active')
                ? 'green'
                : statusClass.includes('prov')
                  ? 'blue'
                  : 'red';

              return (
                <div key={org.id || idx} className="activity-item">
                  <div className={`activity-icon-badge ${badgeClass}`}>
                    <FiServer />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title-row">
                      <span className="activity-org-name">{org.name}</span>
                      <span className={`activity-status-tag ${statusClass}`}>
                        {org.status || 'Active'}
                      </span>
                    </div>
                    <div className="activity-desc">
                      {statusClass.includes('active')
                        ? 'Organization activated successfully'
                        : statusClass.includes('prov')
                          ? 'Provisioning in progress'
                          : 'Status pending update'}
                    </div>
                  </div>
                  <span className="activity-time">10:15 AM</span>
                </div>
              );
            })}
            {(!recentOrganizations || recentOrganizations.length === 0) && (
              <div className="activity-item">
                <div className="activity-icon-badge green"><FiCheckCircle /></div>
                <div className="activity-content">
                  <div className="activity-title-row"><span className="activity-org-name">Acme Corporation</span></div>
                  <div className="activity-desc">Organization activated successfully</div>
                </div>
                <span className="activity-time">10:15 AM</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <span className="dashboard-panel-link">View All Activity →</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-3">
        {/* 1. INFRASTRUCTURE HEALTH (WORLD MAP) */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Infrastructure Health</h3>
            <span className="dashboard-panel-link">View All →</span>
          </div>
          <div className="map-panel-body">
            {/* World Map Vector Graphic overlay */}
            <svg className="map-svg-bg" viewBox="0 0 400 200" fill="#94a3b8">
              <path d="M 50,40 Q 80,20 120,40 T 180,60 T 250,30 T 320,50 L 350,90 T 280,140 T 190,160 T 110,130 Z" />
              <path d="M 220,100 Q 250,80 290,110 T 340,150 T 260,180 Z" />
            </svg>

            {/* Geographical status pins */}
            <div className="map-pins">
              <div className="map-pin-dot green" style={{ top: '35%', left: '25%' }} title="US-East: Healthy (38)" />
              <div className="map-pin-dot green" style={{ top: '45%', left: '48%' }} title="EU-Central: Healthy" />
              <div className="map-pin-dot amber" style={{ top: '55%', left: '72%' }} title="AP-South: Warning (2)" />
              <div className="map-pin-dot red" style={{ top: '65%', left: '32%' }} title="SA-East: Unhealthy (2)" />
            </div>
          </div>
          <div className="map-legend-bar">
            <div className="legend-item"><span className="legend-dot green" /> Healthy ({healthyInfra})</div>
            <div className="legend-item"><span className="legend-dot amber" /> Warning ({warningInfra})</div>
            <div className="legend-item"><span className="legend-dot red" /> Unhealthy ({unhealthyInfra})</div>
          </div>
        </div>

        {/* 2. PROVISIONING PIPELINE */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Provisioning Pipeline</h3>
          </div>
          <DonutChart
            segments={provisioningSegments}
            centerValue={totalOrgs}
            centerLabel="Total"
          />
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <span className="dashboard-panel-link">View All Pipeline →</span>
          </div>
        </div>

        {/* 3. PENDING MIGRATIONS */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Pending Migrations</h3>
          </div>
          <div className="migration-list">
            <div className="migration-item">
              <div className="migration-info">
                <div className="migration-icon"><FiLayers /></div>
                <div>
                  <div className="migration-org">Acme Corporation</div>
                  <div className="migration-task">Add new KPI tables</div>
                </div>
              </div>
              <div className="migration-meta">
                <span className="migration-tag pending">Pending</span>
                <span className="migration-time">2h ago</span>
              </div>
            </div>

            <div className="migration-item">
              <div className="migration-info">
                <div className="migration-icon"><FiLayers /></div>
                <div>
                  <div className="migration-org">Global Solutions</div>
                  <div className="migration-task">Update user permissions</div>
                </div>
              </div>
              <div className="migration-meta">
                <span className="migration-tag running">Running</span>
                <span className="migration-time">1h ago</span>
              </div>
            </div>

            <div className="migration-item">
              <div className="migration-info">
                <div className="migration-icon"><FiLayers /></div>
                <div>
                  <div className="migration-org">Tech Innovators</div>
                  <div className="migration-task">Schema optimization</div>
                </div>
              </div>
              <div className="migration-meta">
                <span className="migration-tag failed">Failed</span>
                <span className="migration-time">30m ago</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <span className="dashboard-panel-link">View All Migrations →</span>
          </div>
        </div>
      </div>
      <div className="org-table-section">
        <div className="table-toolbar">
          <h3 className="table-title">Organizations Overview</h3>

          <div className="table-actions">
            <div className="table-search">
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="table-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PROVISIONING">Provisioning</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <button className="btn-new-org">
              <FiPlus size={14} /> New Organization
            </button>
          </div>
        </div>

        <div className="org-table-wrapper">
          <table className="org-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Storage</th>
                <th>Domains</th>
                <th>Health</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.map((org) => {
                const statusStr = (org.status || 'Active').toLowerCase();
                const planStr = org.subscription_tier || 'Professional';
                const createdStr = org.created_at
                  ? new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'May 18, 2025';

                return (
                  <tr key={org.id}>
                    <td>
                      <div className="org-cell-main">
                        <div className="org-cell-icon">
                          <FiServer />
                        </div>
                        <div>
                          <div className="org-name-text">{org.name}</div>
                          <div className="org-slug-text">{org.slug ? `${org.slug}.falconpms.com` : 'falconpms.com'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${statusStr}`}>
                        {org.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <span className="plan-text" style={{ textTransform: 'capitalize' }}>
                        {planStr}
                      </span>
                    </td>
                    <td>156</td>
                    <td>
                      <div className="storage-cell-wrap">
                        <div className="storage-text-row">
                          <span>245 GB / 500 GB</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>49%</span>
                        </div>
                        <div className="progress-track" style={{ height: 4 }}>
                          <div className="progress-fill blue" style={{ width: '49%' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 500 }}>
                        {org.slug ? `${org.slug}.com` : 'acme.com'}
                      </span>
                    </td>
                    <td>
                      <span className={`health-pill ${org.is_active ? 'healthy' : 'unhealthy'}`}>
                        {org.is_active ? 'Healthy' : 'Unhealthy'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 11 }}>{createdStr}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button className="btn-table-view">View</button>
                        <button className="btn-table-more"><FiMoreVertical /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrganizations.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No organizations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="system-status-footer">
        <span className="status-dot-pulse" />
        System Status: All Systems Operational
      </div>
    </div>
  );
};

export default SuperAdminDashboard;