// components/tenant/dashboard/StatsCard.jsx
import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle }) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const colors = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444',
    indigo: '#6366f1',
    pink: '#ec4899',
    teal: '#14b8a6',
  };
  const bgColors = {
    blue: '#dbeafe',
    green: '#dcfce7',
    purple: '#ede9fe',
    orange: '#ffedd5',
    red: '#fee2e2',
    indigo: '#e0e7ff',
    pink: '#fce7f3',
    teal: '#ccfbf1',
  };
  const colorHex = colors[color] || '#3b82f6';
  const bgHex = bgColors[color] || '#dbeafe';

  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-flex-between">
        <div>
          <p className="dashboard-stat-label">{title}</p>
          <p className="dashboard-stat-value">{value}</p>
          {change !== undefined && change !== null && (
            <p className={`dashboard-stat-change ${isPositive ? 'dashboard-stat-change-up' : isNegative ? 'dashboard-stat-change-down' : ''}`}>
              {isPositive && <FiTrendingUp size={12} />}
              {isNegative && <FiTrendingDown size={12} />}
              {Math.abs(change)}%
            </p>
          )}
          {subtitle && <p className="dashboard-text-xs dashboard-text-muted dashboard-mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="dashboard-stat-icon" style={{ background: bgHex, color: colorHex }}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;