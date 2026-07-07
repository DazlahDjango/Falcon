// pages/tenant/ResourceDashboardPage.jsx
// Dedicated full-page resource analytics dashboard — shows summary, analytics charts,
// exceeded list, and health status for an organization or globally.
import React, { useEffect, useCallback, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiRefreshCw, FiDatabase, FiAlertCircle, FiActivity,
  FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiZap,
} from 'react-icons/fi';
import { useResources } from '../../hooks/tenant';
import { ResourceUsageDashboard, ResourceHistoryChart, QuotaWarningAlert } from '../../components/tenant/resources';
import { TENANT_ROUTES } from '../../config/constants/tenantRouteConstants';

const HEALTH_CONFIG = {
  healthy:  { icon: FiCheckCircle,   color: '#22c55e', bg: '#f0fdf4', label: 'All Healthy' },
  warning:  { icon: FiAlertTriangle, color: '#f59e0b', bg: '#fffbeb', label: 'Usage Warning' },
  critical: { icon: FiAlertCircle,   color: '#ef4444', bg: '#fef2f2', label: 'Limit Exceeded' },
  no_data:  { icon: FiDatabase,      color: '#94a3b8', bg: '#f8fafc', label: 'No Data' },
};

const RESOURCE_TYPE_OPTIONS = [
  'USERS', 'STORAGE_MB', 'API_CALLS_PER_DAY',
  'KPIS', 'DEPARTMENTS', 'CONCURRENT_SESSIONS',
];

const ResourceDashboardPage = () => {
  const { orgId } = useParams();

  const {
    resources,
    summary,
    analytics,
    exceededList,
    overallHealth,
    loading,
    error,
    fetchList,
    fetchSummary,
    fetchAnalytics,
    fetchExceeded,
    syncFromBilling,
    increment,
    decrement,
  } = useResources({
    autoFetch: true,
    filters: orgId ? { organization_id: orgId } : {},
  });

  const [selectedType, setSelectedType] = useState('USERS');
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [syncing, setSyncing] = useState(false);

  // Load all enterprise data on mount
  useEffect(() => {
    if (orgId) {
      fetchSummary(orgId).catch(() => {});
    }
    fetchExceeded().catch(() => {});
  }, [orgId, fetchSummary, fetchExceeded]);

  // Reload analytics when type/days changes
  useEffect(() => {
    if (orgId && selectedType) {
      fetchAnalytics(orgId, selectedType, analyticsDays).catch(() => {});
    }
  }, [orgId, selectedType, analyticsDays, fetchAnalytics]);

  const handleRefresh = useCallback(() => {
    fetchList();
    if (orgId) {
      fetchSummary(orgId).catch(() => {});
      fetchAnalytics(orgId, selectedType, analyticsDays).catch(() => {});
    }
    fetchExceeded().catch(() => {});
  }, [fetchList, fetchSummary, fetchAnalytics, fetchExceeded, orgId, selectedType, analyticsDays]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try { await syncFromBilling(orgId || null); fetchList(); }
    catch (err) { console.error('Sync failed:', err); }
    finally { setSyncing(false); }
  }, [syncFromBilling, orgId, fetchList]);

  // Build history data from analytics response
  const analyticsData = analytics[selectedType];
  const historyData = analyticsData?.history || analyticsData?.snapshots || [];

  const healthCfg = HEALTH_CONFIG[overallHealth] || HEALTH_CONFIG.no_data;
  const HealthIcon = healthCfg.icon;

  // Summary stats derived from summary or resource list
  const dataSource = summary.length > 0 ? summary : resources;
  const totalResources = dataSource.length;
  const exceededCount = exceededList.length;
  const warningCount = dataSource.filter(r => r.is_warning && !r.is_exceeded).length;
  const healthyCount = dataSource.filter(r => !r.is_exceeded && !r.is_warning).length;

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Resource Dashboard
            </h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', fontWeight: 600, color: healthCfg.color,
              background: healthCfg.bg, padding: '4px 12px', borderRadius: '99px',
              border: `1px solid ${healthCfg.color}30`,
            }}>
              <HealthIcon size={13} /> {healthCfg.label}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
            {orgId ? `Organization: ${orgId}` : 'All organizations'} — usage analytics and limit monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', background: '#f1f5f9', color: '#475569',
              border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 500,
              fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <FiRefreshCw size={14} className={loading ? 'resource-loading-spinner' : ''} />
            Refresh
          </button>
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '8px', fontWeight: 600,
              fontSize: '13px', cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: (syncing || loading) ? 0.7 : 1,
            }}
          >
            <FiDatabase size={14} />
            {syncing ? 'Syncing...' : 'Sync Billing'}
          </button>
          <Link
            to={orgId ? TENANT_ROUTES.RESOURCES_ORGANIZATION(orgId) : TENANT_ROUTES.RESOURCES}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', background: '#f1f5f9', color: '#475569',
              border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 500,
              fontSize: '13px', textDecoration: 'none',
            }}
          >
            <FiActivity size={14} />
            Resource List
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <FiAlertCircle size={16} />
          Failed to load resource data. Try refreshing.
        </div>
      )}

      {/* Exceeded alert strip */}
      {exceededList.length > 0 && (
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {exceededList.map((r, i) => (
            <QuotaWarningAlert
              key={i}
              warning={{
                resource_type: r.resource_type_display || r.resource_type,
                percentage: r.percentage_used,
                current: r.current_value,
                limit: r.limit_value,
                severity: 'critical',
                title: `${r.resource_type_display || r.resource_type} limit exceeded`,
              }}
            />
          ))}
        </div>
      )}

      {/* KPI stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Resources', value: totalResources, color: '#6366f1', icon: FiDatabase },
          { label: 'Exceeded',        value: exceededCount,  color: '#ef4444', icon: FiAlertCircle },
          { label: 'Warning',         value: warningCount,   color: '#f59e0b', icon: FiAlertTriangle },
          { label: 'Healthy',         value: healthyCount,   color: '#22c55e', icon: FiCheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <span style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Usage dashboard (cards grid) */}
      <ResourceUsageDashboard
        organizationId={orgId}
        loading={loading}
      />

      {/* Analytics section */}
      <div style={{ marginTop: '32px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiTrendingUp size={16} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Usage Analytics
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#0f172a' }}
            >
              {RESOURCE_TYPE_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {[7, 14, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setAnalyticsDays(days)}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                  cursor: 'pointer', border: 'none',
                  background: analyticsDays === days ? '#6366f1' : '#f1f5f9',
                  color: analyticsDays === days ? '#fff' : '#475569',
                }}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {historyData.length > 0 ? (
          <ResourceHistoryChart
            history={historyData}
            resourceType={selectedType}
            loading={loading}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            {loading ? (
              <div className="resource-loading-spinner" style={{ margin: '0 auto' }}></div>
            ) : (
              <>
                <FiActivity size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>
                  {orgId
                    ? 'No analytics history yet for this resource type. Take snapshots to build history.'
                    : 'Select an organization-scoped URL to view analytics.'}
                </p>
              </>
            )}
          </div>
        )}

        {analyticsData && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Peak Usage',    value: analyticsData.peak_usage ?? '—' },
              { label: 'Avg Usage',     value: analyticsData.avg_usage != null ? Math.round(analyticsData.avg_usage) : '—' },
              { label: 'Data Points',   value: historyData.length },
              { label: 'Burst Events',  value: analyticsData.burst_events ?? 0, icon: FiZap, color: '#7c3aed' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', minWidth: '100px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 3px', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: color || '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {Icon && <Icon size={14} style={{ color }} />}{value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDashboardPage;
