import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, StatusBadge, LoadingSkeleton } from '../../../components/dashboard/common';

export const MissingDataPanel = ({ data, loading, onNotifyUser }) => {
  if (loading) {
    return <LoadingSkeleton type="list" count={3} />;
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title="Missing Data">
        <div className="empty-state">All data entries are complete</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Missing Data Alerts">
      <div className="missing-data-list">
        {data.slice(0, 5).map((item, index) => (
          <div key={index} className="missing-item">
            <div className="missing-info">
              <div className="missing-title">{item.kpi_name}</div>
              <div className="missing-details">
                <span>Owner: {item.user_name}</span>
                <StatusBadge status="warning" text="Missing" size="small" />
              </div>
            </div>
            {onNotifyUser && (
              <button
                onClick={() => onNotifyUser(item)}
                className="notify-btn"
              >
                Send Reminder
              </button>
            )}
          </div>
        ))}
        {data.length > 5 && (
          <div className="view-all">
            <button>View all {data.length} missing entries</button>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

MissingDataPanel.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  onNotifyUser: PropTypes.func
};
export default MissingDataPanel;