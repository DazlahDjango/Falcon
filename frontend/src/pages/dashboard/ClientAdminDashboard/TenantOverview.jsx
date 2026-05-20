import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, ScoreGauge, LoadingSkeleton } from '../../../components/dashboard/common';

export const TenantOverview = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!data) {
    return (
      <DashboardCard title="Tenant Overview">
        <div className="empty-state">No tenant data available</div>
      </DashboardCard>
    );
  }

  const metrics = [
    { label: 'Total Users', value: data.total_users || 0, icon: '👥' },
    { label: 'Active Users', value: data.active_users || 0, icon: '🟢' },
    { label: 'Total KPIs', value: data.total_kpis || 0, icon: '📊' },
    { label: 'Health Score', value: `${data.health_score || 0}%`, icon: '💚' }
  ];

  return (
    <DashboardCard title="Tenant Overview">
      <div className="tenant-overview">
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-item">
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-label">{metric.label}</div>
            </div>
          ))}
        </div>
        
        <div className="health-score">
          <ScoreGauge score={data.health_score || 0} size={100} />
          <div className="score-label">Overall Health</div>
        </div>
      </div>
    </DashboardCard>
  );
};

TenantOverview.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};