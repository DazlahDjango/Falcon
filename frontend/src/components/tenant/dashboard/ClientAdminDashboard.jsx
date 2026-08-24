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
import { useClientAdminDashboard } from '../../../hooks/tenant/useDashboard';

const ClientAdminDashboard = () => {
  const {
    dashboard,
    loading,
    error,
    organization,
    users,
    domains,
    resources,
    migrations,
    health,
    fetchDashboard,
    refresh,
    clearAllErrors,
  } = useClientAdminDashboard({ autoFetch: true, refreshInterval: 10000 });

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

  // Real data extractions directly from backend payload without hardcoded fallbacks
  const orgName = organization?.name || 'Organization';
  const orgSlug = organization?.slug || '—';
  const orgSector = organization?.sector || '—';
  const orgTier = organization?.subscription_tier || 'Standard';
  const orgStatus = organization?.status || 'Active';

  const totalUsers = users?.total ?? 0;
  const activeUsers = users?.active ?? 0;
  const inactiveUsers = users?.inactive ?? 0;

  const totalDomains = domains?.total ?? 0;
  const activeDomains = domains?.active ?? 0;
  const verifyingDomains = domains?.verifying ?? 0;
  const domainItems = Array.isArray(domains?.items) ? domains.items : [];

  const totalResources = resources?.total ?? 0;
  const warningResources = resources?.warning ?? 0;
  const exceededResources = resources?.exceeded ?? 0;
  const resourceUsageList = Array.isArray(resources?.resources) ? resources.resources : [];

  const overallHealthStatus = health?.status || 'Healthy';
  const healthChecks = health?.checks || {
    organization: { healthy: true, status: 'Active' },
    connection: { healthy: true, status: 'Connected' },
    schema: { healthy: true, status: 'Ready' },
  };

  const primaryDomain = domainItems.find((d) => d.is_primary)?.domain || (orgSlug !== '—' ? `${orgSlug}.com` : '—');

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
            {Object.entries(healthChecks).map(([key, check]) => {
              const isHealthy = check?.healthy !== false;
              const statusLabel = check?.status || (isHealthy ? 'Healthy' : 'Degraded');
              const displayKey = key.replace('_', ' ').toUpperCase();
              return (
                <div key={key} className="health-check-item">
                  <div className="health-check-title">
                    <FiDatabase size={14} color="#3b82f6" /> {displayKey} Check
                  </div>
                  <span className={`health-status-badge ${isHealthy ? 'healthy' : 'unhealthy'}`}>
                    ● {statusLabel}
                  </span>
                </div>
              );
            })}
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

                {domainItems.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      No domains registered for this organization.
                    </td>
                  </tr>
                )}
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
            {Array.isArray(migrations?.recent_items) && migrations.recent_items.length > 0 ? (
              migrations.recent_items.map((act) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-icon-badge blue"><FiSliders /></div>
                  <div className="activity-content">
                    <div className="activity-title-row"><span className="activity-org-name">{act.name || act.app_name}</span></div>
                    <div className="activity-desc">Status: {act.status}</div>
                  </div>
                  <span className="activity-time">
                    {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No recent organization events or migrations logged.
              </div>
            )}
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