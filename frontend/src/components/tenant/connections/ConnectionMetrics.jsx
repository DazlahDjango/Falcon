// components/tenant/connections/ConnectionMetrics.jsx
import React, { useEffect } from 'react';
import { FiZap, FiClock, FiX, FiAlertCircle, FiRefreshCw, FiCpu, FiTrendingUp, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { useConnections } from '../../../hooks/tenant';

const ConnectionMetrics = ({ organizationId, onRefresh }) => {
  const { metrics, fetchMetrics, loading } = useConnections({ autoFetch: false });

  useEffect(() => {
    const params = organizationId ? { organization_id: organizationId } : {};
    fetchMetrics(params);
  }, [organizationId, fetchMetrics]);

  const handleRefresh = async () => {
    const params = organizationId ? { organization_id: organizationId } : {};
    await fetchMetrics(params);
    if (onRefresh) onRefresh();
  };

  const data = metrics || {
    total_connections: 0,
    active_connections: 0,
    idle_connections: 0,
    error_connections: 0,
    closed_connections: 0,
    local_acquisitions: 0,
    local_failures: 0,
    local_recycles: 0,
    avg_lock_wait_time_seconds: 0
  };

  const metricCards = [
    { label: 'Total Pool Size', value: data.total_connections || 0, icon: FiZap, color: '#3b82f6' },
    { label: 'Active Sessions', value: data.active_connections || 0, icon: FiActivity, color: '#22c55e' },
    { label: 'Idle Sessions', value: data.idle_connections || 0, icon: FiClock, color: '#f59e0b' },
    { label: 'Error States', value: data.error_connections || 0, icon: FiAlertCircle, color: '#ef4444' },
    { label: 'Closed Records', value: data.closed_connections || 0, icon: FiX, color: '#94a3b8' },
  ];

  const diagnosticMetrics = [
    { label: 'Total Acquisitions', value: data.local_acquisitions || 0, icon: FiTrendingUp, color: '#6366f1' },
    { label: 'Connection Failures', value: data.local_failures || 0, icon: FiAlertTriangle, color: '#ec4899' },
    { label: 'Stale Recycles', value: data.local_recycles || 0, icon: FiCpu, color: '#8b5cf6' },
    { label: 'Avg Lock Wait Time', value: `${(data.avg_lock_wait_time_seconds || 0).toFixed(4)}s`, icon: FiClock, color: '#14b8a6' },
  ];

  return (
    <div className="connection-metrics-container">
      <div className="connection-flex-between connection-mb-4">
        <h4 className="connection-font-semibold connection-text-sm" style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCpu style={{ color: '#6366f1' }} />
          Connection Metrics & Diagnostic Counters
        </h4>
        <button className="connection-btn connection-btn-secondary connection-btn-sm" onClick={handleRefresh} disabled={loading}>
          <FiRefreshCw size={14} className={loading ? 'connection-loading-spinner' : ''} style={loading ? { width: '14px', height: '14px', borderWidth: '2px' } : {}} />
          {!loading && 'Refresh'}
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="connection-grid connection-grid-cols-5 connection-gap-4 connection-mb-6">
        {metricCards.map((card) => (
          <div key={card.label} className="connection-stat-card" style={{ textAlign: 'center' }}>
            <div className="connection-flex-center connection-mb-2">
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <p className="connection-stat-value" style={{ color: card.color, fontSize: '20px' }}>{card.value}</p>
            <p className="connection-stat-label" style={{ fontSize: '12px' }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="connection-divider" style={{ margin: '16px 0' }}></div>

      {/* Diagnostics Panel */}
      <div>
        <p className="connection-text-xs connection-text-muted connection-mb-3 connection-font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Performance & Diagnostics (Local Node)
        </p>
        <div className="connection-grid connection-grid-cols-4 connection-gap-4">
          {diagnosticMetrics.map((metric) => (
            <div key={metric.label} className="connection-stat-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <div style={{ padding: '8px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <metric.icon size={18} style={{ color: metric.color }} />
              </div>
              <div>
                <p className="connection-stat-value" style={{ color: '#0f172a', fontSize: '16px', marginTop: 0, lineHeight: 1 }}>{metric.value}</p>
                <p className="connection-stat-label" style={{ fontSize: '11px', marginTop: '2px' }}>{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionMetrics;