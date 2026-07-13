// components/tenant/dashboard/SystemHealth.jsx
import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiClock } from 'react-icons/fi';

const SystemHealth = ({ health }) => {
  const items = [
    { key: 'database', label: 'Database', icon: FiCheckCircle },
    { key: 'cache', label: 'Cache', icon: FiClock },
    { key: 'celery', label: 'Celery', icon: FiCheckCircle },
    { key: 'redis', label: 'Redis', icon: FiCheckCircle },
  ];

  const getStatus = (key) => {
    if (!health) return 'unknown';
    const status = health[key]?.status || health?.database?.status;
    if (status === 'healthy' || status === 'connected') return 'healthy';
    if (status === 'warning') return 'warning';
    if (status === 'unhealthy' || status === 'error') return 'unhealthy';
    return 'unknown';
  };

  const statusConfig = {
    healthy: { label: 'Healthy', className: 'dashboard-badge-green', icon: FiCheckCircle },
    warning: { label: 'Warning', className: 'dashboard-badge-yellow', icon: FiAlertCircle },
    unhealthy: { label: 'Unhealthy', className: 'dashboard-badge-red', icon: FiXCircle },
    unknown: { label: 'Unknown', className: 'dashboard-badge-gray', icon: FiClock },
  };

  return (
    <div className="dashboard-card">
      <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>System Health</h4>
      <div className="dashboard-grid dashboard-grid-cols-2 dashboard-gap-2">
        {items.map((item) => {
          const status = getStatus(item.key);
          const config = statusConfig[status] || statusConfig.unknown;
          const Icon = config.icon;
          return (
            <div key={item.key} className="dashboard-flex dashboard-gap-2" style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span className="dashboard-text-sm" style={{ color: '#0f172a', flex: 1 }}>{item.label}</span>
              <span className={`dashboard-badge ${config.className}`}>
                <Icon size={12} style={{ marginRight: '4px' }} />
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHealth;