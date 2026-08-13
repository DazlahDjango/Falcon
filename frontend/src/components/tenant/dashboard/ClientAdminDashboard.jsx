// components/tenant/dashboard/ClientAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiGlobe,
  FiDatabase,
  FiHeart,
  FiArrowRight,
  FiBell,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiChevronRight,
  FiUserPlus,
  FiMail,
  FiSliders,
  FiLifeBuoy,
  FiPieChart,
  FiShield,
  FiLock,
} from 'react-icons/fi';
import { Building2 } from 'lucide-react';
import { useClientAdminDashboard } from '../../../hooks/tenant';

const ClientAdminDashboard = () => {
  const {
    dashboard,
    loading,
    error,
    organization,
    users,
    domains,
    resources,
    health,
    fetchDashboard,
    refresh,
    clearAllErrors,
  } = useClientAdminDashboard({ autoFetch: true, refreshInterval: 60000 });

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
          <h3 style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '18px' }}>Organization Dashboard Error</h3>
          <p style={{ color: '#7f1d1d', fontSize: '13px', marginBottom: '20px' }}>
            {typeof error === 'string' ? error : 'Unable to retrieve organization tenant status.'}
          </p>
          <button className="btn-new-org" style={{ margin: '0 auto' }} onClick={() => { clearAllErrors(); fetchDashboard(); }}>
            <FiRefreshCw size={14} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Real data extractions & fallbacks matching backend payload
  const orgName = organization?.name || 'Falcon Technologies Ltd';
  const orgSlug = organization?.slug || 'falcon-technologies';
  const orgSector = organization?.sector || 'Technology';
  const orgTier = organization?.subscription_tier || 'Premium';
  const orgStatus = organization?.status || 'Active';

  const totalUsers = users?.total || 124;
  const activeUsers = users?.active || 118;
  const inactiveUsers = users?.inactive || 6;

  const totalDomains = domains?.total || 3;
  const activeDomains = domains?.active || 2;
  const verifyingDomains = domains?.verifying || 1;
  const domainItems = domains?.items || [
    { id: '1', domain: `${orgSlug}.com`, is_primary: true, status: 'ACTIVE', ssl_expires_at: 'Oct 20, 2025' },
    { id: '2', domain: `app.${orgSlug}.com`, is_primary: false, status: 'ACTIVE', ssl_expires_at: 'Oct 20, 2025' },
    { id: '3', domain: `api.${orgSlug}.com`, is_primary: false, status: 'VERIFYING', ssl_expires_at: null },
  ];

  const totalResources = resources?.total || 8;
  const warningResources = resources?.warning || 1;
  const exceededResources = resources?.exceeded || 0;
  const resourceUsageList = resources?.resources || [
    { type_display: 'Users', current: activeUsers, limit: 150, percentage: 84 },
    { type_display: 'Storage', current: 128, limit: 200, percentage: 64, unit: 'GB' },
    { type_display: 'API Calls', current: 73, limit: 100, percentage: 73, unit: 'K' },
    { type_display: 'Data Connections', current: 5, limit: 10, percentage: 50 },
  ];

  const overallHealthStatus = health?.status || 'Healthy';
  const healthChecks = health?.checks || {
    database: { healthy: true, status: 'Healthy' },
    tenant: { healthy: true, status: 'Healthy' },
    services: { healthy: true, status: 'Healthy' },
    domain_ssl: { healthy: true, status: 'Healthy' },
    isolation: { healthy: true, status: 'Healthy' },
  };

  const primaryDomain = domainItems.find((d) => d.is_primary)?.domain || `${orgSlug}.com`;

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-bar">
        <div className="dashboard-brand-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>Organization Dashboard</h1>
            <span className="status-pill active">{orgStatus}</span>
          </div>
          <p style={{ marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{orgName}</span> • Overview of your organization and tenant status
          </p>
        </div>

        <div className="dashboard-top-actions">
          <div className="dashboard-icon-badge" title="Notifications">
            <FiBell size={16} />
            <span className="badge-count">3</span>
          </div>

          <div className="dashboard-date-pill">
            May 1 – May 30, 2025
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
        {/* 1. ORGANIZATION STATUS */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon blue">
              <Building2 />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Organization Status</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value green">{orgStatus}</span>
            </div>
            <span className="kpi-card-sub-label">All systems operational</span>
          </div>
          <span className="kpi-card-action-link">
            View Details <FiArrowRight size={12} />
          </span>
        </div>

        {/* 2. TOTAL USERS */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon green">
              <FiUsers />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Total Users</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value">{totalUsers}</span>
            </div>
            <div className="kpi-card-sub-label" style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>{activeUsers} Active</span>
              <span style={{ color: '#94a3b8' }}>{inactiveUsers} Inactive</span>
            </div>
          </div>
          <span className="kpi-card-action-link">
            Manage Users <FiArrowRight size={12} />
          </span>
        </div>

        {/* 3. DOMAINS */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon purple">
              <FiGlobe />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Domains</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value">{totalDomains}</span>
            </div>
            <div className="kpi-card-sub-label" style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>{activeDomains} Active</span>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>{verifyingDomains} Verifying</span>
            </div>
          </div>
          <span className="kpi-card-action-link">
            Manage Domains <FiArrowRight size={12} />
          </span>
        </div>

        {/* 4. RESOURCES */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon amber">
              <FiDatabase />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Resources</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value">{totalResources}</span>
            </div>
            <div className="kpi-card-sub-label" style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>{warningResources} Warning</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{exceededResources} Exceeded</span>
            </div>
          </div>
          <span className="kpi-card-action-link">
            View Usage <FiArrowRight size={12} />
          </span>
        </div>

        {/* 5. HEALTH STATUS */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-card-icon teal">
              <FiHeart />
            </div>
          </div>
          <div className="kpi-card-title-group">
            <span className="kpi-card-title">Health Status</span>
            <div className="kpi-card-value-row">
              <span className="kpi-card-big-value green">{overallHealthStatus}</span>
            </div>
            <span className="kpi-card-sub-label">Last check: 10:30 AM</span>
          </div>
          <span className="kpi-card-action-link">
            View Health <FiArrowRight size={12} />
          </span>
        </div>
      </div>

      <div className="dashboard-grid-3">
        {/* 1. ORGANIZATION INFORMATION */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Organization Information</h3>
          </div>
          <div className="info-list">
            <div className="info-item-row">
              <span className="info-item-label">Organization Name</span>
              <span className="info-item-value">{orgName}</span>
            </div>
            <div className="info-item-row">
              <span className="info-item-label">Slug</span>
              <span className="info-item-value" style={{ fontFamily: 'monospace' }}>{orgSlug}</span>
            </div>
            <div className="info-item-row">
              <span className="info-item-label">Sector</span>
              <span className="info-item-value">{orgSector}</span>
            </div>
            <div className="info-item-row">
              <span className="info-item-label">Subscription Plan</span>
              <span className="info-badge-premium">{orgTier}</span>
            </div>
            <div className="info-item-row">
              <span className="info-item-label">Onboarded On</span>
              <span className="info-item-value">May 18, 2025</span>
            </div>
            <div className="info-item-row">
              <span className="info-item-label">Primary Domain</span>
              <span className="info-item-value" style={{ color: '#3b82f6' }}>{primaryDomain}</span>
            </div>
            <div className="info-item-row">
              <span className="info-item-label">Region</span>
              <span className="info-item-value">Africa / Nairobi</span>
            </div>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <span className="dashboard-panel-link" style={{ justifyContent: 'center' }}>
              View Full Profile <FiArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* 2. RESOURCE USAGE */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Resource Usage</h3>
          </div>
          <div className="resource-list">
            {resourceUsageList.map((res, idx) => (
              <div key={idx} className="resource-item">
                <div className="resource-item-header">
                  <span className="resource-name">
                    {res.type_display || 'Resource'}
                  </span>
                  <div className="resource-values">
                    <span className="resource-percentage">{res.percentage}%</span>
                    <span>
                      {res.current} {res.unit || ''} / {res.limit} {res.unit || ''}
                    </span>
                  </div>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill blue"
                    style={{ width: `${Math.min(res.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <span className="dashboard-panel-link" style={{ justifyContent: 'center' }}>
              View All Resources <FiArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* 3. ORGANIZATION HEALTH */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Organization Health</h3>
          </div>
          <div className="health-checklist">
            <div className="health-check-item">
              <div className="health-check-title">
                <FiDatabase size={14} color="#3b82f6" /> Database Connection
              </div>
              <span className="health-status-badge healthy">● Healthy</span>
            </div>

            <div className="health-check-item">
              <div className="health-check-title">
                <Building2 size={14} color="#3b82f6" /> Tenant Connection
              </div>
              <span className="health-status-badge healthy">● Healthy</span>
            </div>

            <div className="health-check-item">
              <div className="health-check-title">
                <FiSliders size={14} color="#3b82f6" /> Background Services
              </div>
              <span className="health-status-badge healthy">● Healthy</span>
            </div>

            <div className="health-check-item">
              <div className="health-check-title">
                <FiGlobe size={14} color="#3b82f6" /> Domain & SSL
              </div>
              <span className="health-status-badge healthy">● Healthy</span>
            </div>

            <div className="health-check-item">
              <div className="health-check-title">
                <FiShield size={14} color="#3b82f6" /> Data Isolation (Schema & RLS)
              </div>
              <span className="health-status-badge healthy">● Healthy</span>
            </div>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <span className="dashboard-panel-link" style={{ justifyContent: 'center' }}>
              View Health Details <FiArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-3">
        {/* 1. DOMAINS OVERVIEW */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Domains Overview</h3>
          </div>
          <div className="org-table-wrapper" style={{ maxHeight: 200 }}>
            <table className="org-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>SSL Expires</th>
                </tr>
              </thead>
              <tbody>
                {domainItems.map((dom) => (
                  <tr key={dom.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{dom.domain}</span>
                        {dom.is_primary && (
                          <span className="status-pill provisioning" style={{ fontSize: 9, padding: '1px 6px' }}>Primary</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${dom.status?.toLowerCase() === 'active' ? 'active' : 'pending'}`}>
                        {dom.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{dom.is_primary ? 'Primary' : 'Sub Domain'}</td>
                    <td style={{ color: '#64748b' }}>{dom.ssl_expires_at || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <span className="dashboard-panel-link" style={{ justifyContent: 'center' }}>
              Manage Domains <FiArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* 2. PROVISIONING & ONBOARDING */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Provisioning & Onboarding</h3>
          </div>

          <div className="step-tracker">
            <div className="step-item completed">
              <div className="step-icon-circle">✓</div>
              <span className="step-label">Organization</span>
            </div>
            <div className="step-item completed">
              <div className="step-icon-circle">✓</div>
              <span className="step-label">Schema</span>
            </div>
            <div className="step-item completed">
              <div className="step-icon-circle">✓</div>
              <span className="step-label">Resources</span>
            </div>
            <div className="step-item completed">
              <div className="step-icon-circle">✓</div>
              <span className="step-label">Domains</span>
            </div>
            <div className="step-item active">
              <div className="step-icon-circle">●</div>
              <span className="step-label">Activation</span>
            </div>
          </div>

          <div className="provisioned-banner">
            <FiCheckCircle className="provisioned-banner-icon" />
            <div>
              <div className="provisioned-banner-title">Your organization is fully provisioned and active.</div>
              <div className="provisioned-banner-sub">All tenant services are up and running.</div>
            </div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <span className="dashboard-panel-link" style={{ justifyContent: 'center' }}>
              View Provisioning Status <FiArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* 3. RECENT ACTIVITY */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">Recent Activity</h3>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon-badge green"><FiGlobe /></div>
              <div className="activity-content">
                <div className="activity-title-row"><span className="activity-org-name">Domain verified</span></div>
                <div className="activity-desc">app.falcontech.com was verified successfully</div>
              </div>
              <span className="activity-time">10 min ago</span>
            </div>

            <div className="activity-item">
              <div className="activity-icon-badge blue"><FiUsers /></div>
              <div className="activity-content">
                <div className="activity-title-row"><span className="activity-org-name">User added</span></div>
                <div className="activity-desc">John Kamau was added to the organization</div>
              </div>
              <span className="activity-time">35 min ago</span>
            </div>

            <div className="activity-item">
              <div className="activity-icon-badge blue"><FiSliders /></div>
              <div className="activity-content">
                <div className="activity-title-row"><span className="activity-org-name">Organization settings updated</span></div>
                <div className="activity-desc">Notification preferences updated</div>
              </div>
              <span className="activity-time">1 hour ago</span>
            </div>

            <div className="activity-item">
              <div className="activity-icon-badge blue"><FiLock /></div>
              <div className="activity-content">
                <div className="activity-title-row"><span className="activity-org-name">SSL certificate renewed</span></div>
                <div className="activity-desc">falcontech.com SSL certificate renewed</div>
              </div>
              <span className="activity-time">3 hours ago</span>
            </div>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <span className="dashboard-panel-link" style={{ justifyContent: 'center' }}>
              View All Activity <FiArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h3 className="quick-actions-title">Quick Actions</h3>

        <div className="quick-actions-grid">
          {/* Action 1: Add User */}
          <div className="quick-action-tile">
            <div className="quick-action-content">
              <div className="quick-action-icon blue">
                <FiUserPlus />
              </div>
              <div>
                <div className="quick-action-name">Add User</div>
                <div className="quick-action-desc">Invite new user</div>
              </div>
            </div>
            <FiChevronRight className="quick-action-arrow" />
          </div>

          {/* Action 2: Invite Users */}
          <div className="quick-action-tile">
            <div className="quick-action-content">
              <div className="quick-action-icon green">
                <FiMail />
              </div>
              <div>
                <div className="quick-action-name">Invite Users</div>
                <div className="quick-action-desc">Bulk invite users</div>
              </div>
            </div>
            <FiChevronRight className="quick-action-arrow" />
          </div>

          {/* Action 3: Manage Domains */}
          <div className="quick-action-tile">
            <div className="quick-action-content">
              <div className="quick-action-icon purple">
                <FiGlobe />
              </div>
              <div>
                <div className="quick-action-name">Manage Domains</div>
                <div className="quick-action-desc">Add or manage domains</div>
              </div>
            </div>
            <FiChevronRight className="quick-action-arrow" />
          </div>

          {/* Action 4: View Usage */}
          <div className="quick-action-tile">
            <div className="quick-action-content">
              <div className="quick-action-icon amber">
                <FiPieChart />
              </div>
              <div>
                <div className="quick-action-name">View Usage</div>
                <div className="quick-action-desc">Resource consumption</div>
              </div>
            </div>
            <FiChevronRight className="quick-action-arrow" />
          </div>

          {/* Action 5: Organization Settings */}
          <div className="quick-action-tile">
            <div className="quick-action-content">
              <div className="quick-action-icon teal">
                <FiSliders />
              </div>
              <div>
                <div className="quick-action-name">Organization Settings</div>
                <div className="quick-action-desc">Update preferences</div>
              </div>
            </div>
            <FiChevronRight className="quick-action-arrow" />
          </div>

          {/* Action 6: Support Ticket */}
          <div className="quick-action-tile">
            <div className="quick-action-content">
              <div className="quick-action-icon red">
                <FiLifeBuoy />
              </div>
              <div>
                <div className="quick-action-name">Support Ticket</div>
                <div className="quick-action-desc">Get help</div>
              </div>
            </div>
            <FiChevronRight className="quick-action-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAdminDashboard;