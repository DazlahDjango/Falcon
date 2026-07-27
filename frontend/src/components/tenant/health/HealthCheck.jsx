// components/tenant/health/HealthCheck.jsx
import React, { useEffect } from 'react';
import { FiRefreshCw, FiDatabase, FiServer, FiGlobe, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { useHealth } from '../../../hooks/tenant';
import HealthStatusCard from './HealthStatusCard';

const HealthCheck = () => {
  const {
    health,
    loading,
    error,
    lastChecked,
    isOverallHealthy,
    summary,
    fetchHealth,
    clearAllErrors,
  } = useHealth({ autoFetch: true, refreshInterval: 60000 });

  const handleRefresh = () => {
    fetchHealth();
  };

  if (error) {
    return (
      <div className="health-container">
        <div className="health-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading health status</p>
          <p className="health-text-sm health-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="health-btn health-btn-primary health-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  const healthItems = [
    { key: 'database', title: 'Database', icon: FiDatabase, status: health?.database?.status, details: health?.database },
    { key: 'schemas', title: 'Schemas', icon: FiServer, status: health?.schemas?.status, details: health?.schemas },
    { key: 'organizations', title: 'Organizations', icon: FiGlobe, status: health?.organizations?.status, details: health?.organizations },
  ];

  const overallStatus = isOverallHealthy ? 'healthy' : 'unhealthy';

  return (
    <div className="health-container">
      <div className="health-header">
        <div>
          <h1 className="health-title">System Health</h1>
          <p className="health-subtitle">
            {lastChecked ? `Last checked: ${new Date(lastChecked).toLocaleString()}` : 'Checking system status...'}
          </p>
        </div>
        <div className="health-flex health-gap-3">
          <button className="health-btn health-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'health-loading-spinner' : ''} style={loading ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
        </div>
      </div>

      <div className="health-grid health-grid-cols-4 health-mb-6">
        <div className="health-stat-card" style={{ textAlign: 'center' }}>
          <div className="health-flex-center health-gap-2">
            {overallStatus === 'healthy' ? (
              <FiCheckCircle size={24} style={{ color: '#22c55e' }} />
            ) : (
              <FiAlertTriangle size={24} style={{ color: '#ef4444' }} />
            )}
            <span className="health-font-semibold health-text-lg" style={{ color: overallStatus === 'healthy' ? '#22c55e' : '#ef4444' }}>
              {overallStatus === 'healthy' ? 'All Systems Operational' : 'System Issues Detected'}
            </span>
          </div>
          <p className="health-text-xs health-text-muted health-mt-2">
            {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
          </p>
        </div>
        <div className="health-stat-card" style={{ textAlign: 'center' }}>
          <p className="health-stat-value" style={{ color: '#22c55e' }}>
            {healthItems.filter(h => h.status === 'healthy').length}
          </p>
          <p className="health-stat-label">Healthy</p>
        </div>
        <div className="health-stat-card" style={{ textAlign: 'center' }}>
          <p className="health-stat-value" style={{ color: '#f59e0b' }}>
            {healthItems.filter(h => h.status === 'warning').length}
          </p>
          <p className="health-stat-label">Warning</p>
        </div>
        <div className="health-stat-card" style={{ textAlign: 'center' }}>
          <p className="health-stat-value" style={{ color: '#ef4444' }}>
            {healthItems.filter(h => h.status === 'unhealthy').length}
          </p>
          <p className="health-stat-label">Unhealthy</p>
        </div>
      </div>

      <div className="health-grid health-grid-cols-3">
        {healthItems.map((item) => (
          <HealthStatusCard
            key={item.key}
            title={item.title}
            status={item.status}
            details={item.details}
            icon={item.icon}
            lastChecked={lastChecked}
          />
        ))}
      </div>

      {health?.organizations && (
        <div className="health-card health-mt-6">
          <h4 className="health-font-semibold health-text-sm" style={{ color: '#0f172a', marginBottom: '8px' }}>
            Organizations
          </h4>
          <div className="health-flex health-gap-4">
            <span className="health-text-sm health-text-muted">Total: {health.organizations.organizations || 0}</span>
            <span className="health-text-sm" style={{ color: '#22c55e' }}>Healthy: {health.organizations.healthy || 0}</span>
            <span className="health-text-sm" style={{ color: '#ef4444' }}>Unhealthy: {health.organizations.unhealthy || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;