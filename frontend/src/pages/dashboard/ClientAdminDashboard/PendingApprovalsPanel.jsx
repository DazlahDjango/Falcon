import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, StatusBadge, LoadingSkeleton } from '../../../components/dashboard/common';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';

export const PendingApprovalsPanel = ({ data, loading }) => {
  const { approveSubmission, rejectSubmission } = useClientAdminDashboard();
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (item) => {
    setProcessingId(item.id);
    await approveSubmission(item.id, 'Approved by admin');
    setProcessingId(null);
  };

  const handleReject = async (item) => {
    setProcessingId(item.id);
    await rejectSubmission(item.id, 'Rejected by admin');
    setProcessingId(null);
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={3} />;
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title="Pending Approvals">
        <div className="empty-state">No pending approvals</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Pending Approvals">
      <div className="pending-approvals-list">
        {data.slice(0, 5).map((item) => (
          <div key={item.id} className="approval-item">
            <div className="approval-info">
              <div className="approval-title">{item.kpi_name}</div>
              <div className="approval-details">
                <span>Submitted by: {item.user_name}</span>
                <span>Value: {item.actual_value}</span>
                <StatusBadge status="pending" size="small" />
              </div>
            </div>
            <div className="approval-actions">
              <button 
                onClick={() => handleApprove(item)}
                disabled={processingId === item.id}
                className="approve-btn"
              >
                Approve
              </button>
              <button 
                onClick={() => handleReject(item)}
                disabled={processingId === item.id}
                className="reject-btn"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {data.length > 5 && (
          <div className="view-all">
            <button>View all {data.length} pending approvals</button>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

PendingApprovalsPanel.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool
};