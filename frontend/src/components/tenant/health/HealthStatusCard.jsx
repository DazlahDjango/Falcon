// components/tenant/health/HealthStatusCard.jsx
import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiClock } from 'react-icons/fi';

const HealthStatusCard = ({ title, status, details, icon: Icon, lastChecked }) => {
  const statusConfig = {
    healthy: { color: '#22c55e', bg: '#dcfce7', icon: FiCheckCircle, label: 'Healthy' },
    unhealthy: { color: '#ef4444', bg: '#fee2e2', icon: FiXCircle, label: 'Unhealthy' },
    warning: { color: '#f59e0b', bg: '#fef9c3', icon: FiAlertCircle, label: 'Warning' },
    unknown: { color: '#94a3b8', bg: '#f1f5f9', icon: FiClock, label: 'Unknown' },
  };
  const config = statusConfig[status?.toLowerCase()] || statusConfig.unknown;
  const StatusIcon = config.icon;

  return (
    <div className="health-status-card">
      <div className="health-flex health-gap-3 health-mb-2">
        {Icon && <Icon size={20} style={{ color: config.color }} />}
        <span className="health-font-semibold health-text-sm" style={{ color: '#0f172a' }}>
          {title}
        </span>
        <span className={`health-badge ${status === 'healthy' ? 'health-badge-green' : status === 'unhealthy' ? 'health-badge-red' : status === 'warning' ? 'health-badge-yellow' : 'health-badge-gray'}`}>
          <StatusIcon size={12} style={{ marginRight: '4px' }} />
          {config.label}
        </span>
      </div>
      {details && (
        <div className="health-text-sm health-text-muted" style={{ marginLeft: '28px' }}>
          {typeof details === 'object' ? JSON.stringify(details) : details}
        </div>
      )}
      {lastChecked && (
        <div className="health-text-xs health-text-muted" style={{ marginLeft: '28px', marginTop: '4px' }}>
          Last checked: {new Date(lastChecked).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default HealthStatusCard;