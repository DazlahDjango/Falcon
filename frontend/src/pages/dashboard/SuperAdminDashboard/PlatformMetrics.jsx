import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, LoadingSkeleton } from '../../../components/dashboard/common';

export const PlatformMetrics = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!data) {
    return (
      <DashboardCard title="Platform Metrics">
        <div className="empty-state">No metrics available</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Platform Metrics (Last 30 Days)">
      <div className="platform-metrics">
        <div className="metric-row">
          <div className="metric">
            <div className="metric-value">{data.total_users_platform?.toLocaleString() || 0}</div>
            <div className="metric-label">Total Users</div>
          </div>
          <div className="metric">
            <div className="metric-value">{data.total_kpis_platform?.toLocaleString() || 0}</div>
            <div className="metric-label">Total KPIs</div>
          </div>
        </div>
        <div className="metric-row">
          <div className="metric">
            <div className="metric-value">{data.submissions_last_30d?.toLocaleString() || 0}</div>
            <div className="metric-label">Submissions</div>
          </div>
          <div className="metric">
            <div className="metric-value">{data.avg_tenants_per_day || 0}</div>
            <div className="metric-label">New Tenants/Day</div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

PlatformMetrics.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};

export default PlatformMetrics;