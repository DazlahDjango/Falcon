import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, LoadingSkeleton } from '../../../components/dashboard/common';

export const UserActivityPanel = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!data) {
    return (
      <DashboardCard title="User Activity">
        <div className="empty-state">No activity data available</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="User Activity (Last 30 Days)">
      <div className="user-activity-stats">
        <div className="stat-card">
          <div className="stat-value">{data.active_users_30d || 0}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.inactive_users || 0}</div>
          <div className="stat-label">Inactive Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.new_users_30d || 0}</div>
          <div className="stat-label">New Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.total_logins_30d || 0}</div>
          <div className="stat-label">Total Logins</div>
        </div>
      </div>
    </DashboardCard>
  );
};

UserActivityPanel.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};
export default UserActivityPanel;