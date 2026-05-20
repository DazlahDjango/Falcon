import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, StatusBadge, LoadingSkeleton } from '../../../components/dashboard/common';

export const CompliancePanel = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!data) {
    return (
      <DashboardCard title="Compliance Status">
        <div className="empty-state">No compliance data available</div>
      </DashboardCard>
    );
  }

  const getRateColor = (rate) => {
    if (rate >= 80) return '#10b981';
    if (rate >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <DashboardCard title="Compliance Status">
      <div className="compliance-stats">
        <div className="stat">
          <div className="stat-label">Data Submission Rate</div>
          <div className="stat-value" style={{ color: getRateColor(data.data_submission_rate) }}>
            {Math.round(data.data_submission_rate || 0)}%
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${data.data_submission_rate || 0}%`, background: getRateColor(data.data_submission_rate) }}
            />
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-label">Review Completion Rate</div>
          <div className="stat-value" style={{ color: getRateColor(data.review_completion_rate) }}>
            {Math.round(data.review_completion_rate || 0)}%
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${data.review_completion_rate || 0}%`, background: getRateColor(data.review_completion_rate) }}
            />
          </div>
        </div>
        
        <div className="compliance-alerts">
          <div className="alert-item">
            <span>Pending Reviews:</span>
            <StatusBadge status={data.pending_reviews > 0 ? 'warning' : 'success'} text={data.pending_reviews} />
          </div>
          <div className="alert-item">
            <span>Overdue Submissions:</span>
            <StatusBadge status={data.overdue_submissions > 0 ? 'critical' : 'success'} text={data.overdue_submissions} />
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

CompliancePanel.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};