import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, LoadingSkeleton } from '../../../components/dashboard/common';

export const PlatformOverview = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!data) {
    return (
      <DashboardCard title="Platform Overview">
        <div className="empty-state">No platform data available</div>
      </DashboardCard>
    );
  }

  const metrics = [
    { label: 'Total Tenants', value: data.total_tenants || 0, icon: '🏢', color: '#3b82f6' },
    { label: 'Active Tenants', value: data.active_tenants || 0, icon: '🟢', color: '#10b981' },
    { label: 'Trial Tenants', value: data.trial_tenants || 0, icon: '📝', color: '#f59e0b' },
    { label: 'Monthly Revenue', value: `$${data.total_revenue?.monthly_recurring || 0}`, icon: '💰', color: '#8b5cf6' }
  ];

  return (
    <DashboardCard title="Platform Overview">
      <div className="platform-metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="platform-metric">
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-value" style={{ color: metric.color }}>{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

PlatformOverview.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};