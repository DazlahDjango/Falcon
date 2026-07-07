// components/tenant/dashboard/KPICard.jsx
import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const KPICard = ({ title, value, target, percentage, change, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444',
  };
  const colorHex = colors[color] || '#3b82f6';

  return (
    <div className="dashboard-card">
      <div className="dashboard-flex dashboard-gap-3 dashboard-mb-2">
        {Icon && <Icon size={18} style={{ color: colorHex }} />}
        <span className="dashboard-text-sm dashboard-text-muted">{title}</span>
      </div>
      <div className="dashboard-flex-between">
        <div>
          <span className="dashboard-stat-value" style={{ fontSize: '22px' }}>{value}</span>
          {target && (
            <span className="dashboard-text-xs dashboard-text-muted dashboard-ml-2">
              / {target}
            </span>
          )}
        </div>
        {change !== undefined && change !== null && (
          <span className={`dashboard-text-xs dashboard-font-medium ${change >= 0 ? 'dashboard-stat-change-up' : 'dashboard-stat-change-down'}`}>
            {change >= 0 ? <FiTrendingUp size={12} style={{ display: 'inline', marginRight: '2px' }} /> : <FiTrendingDown size={12} style={{ display: 'inline', marginRight: '2px' }} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      {percentage !== undefined && (
        <div className="dashboard-mt-2">
          <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(percentage, 100)}%`,
                height: '100%',
                background: percentage >= 100 ? '#22c55e' : percentage >= 70 ? '#f59e0b' : '#ef4444',
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <span className="dashboard-text-xs dashboard-text-muted dashboard-mt-1" style={{ display: 'block' }}>
            {Math.round(percentage)}% of target
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;