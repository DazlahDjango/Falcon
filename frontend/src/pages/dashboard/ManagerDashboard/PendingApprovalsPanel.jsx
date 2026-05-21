// frontend/src/pages/dashboard/ManagerDashboard/PendingApprovalsPanel.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const PendingApprovalsPanel = ({ 
  data, 
  loading, 
  onRefresh, 
  onApprove, 
  onReject 
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const pendingApprovals = data || [];

  const handleApprove = (item) => {
    if (window.confirm(`Approve submission for ${item.kpi_name}?`)) {
      onApprove?.(item.id);
    }
  };

  const handleReject = (item) => {
    setSelectedItem(item);
    setShowRejectModal(true);
  };

  const submitRejection = () => {
    if (selectedItem && rejectComment) {
      onReject?.(selectedItem.id, rejectComment);
      setShowRejectModal(false);
      setRejectComment('');
      setSelectedItem(null);
    }
  };

  const getDaysPending = (submittedAt) => {
    if (!submittedAt) return 0;
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffTime = Math.abs(now - submitted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <DashboardCard 
        title={`Pending Approvals (${pendingApprovals.length})`}
        loading={loading}
        onRefresh={onRefresh}
      >
        {pendingApprovals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No pending approvals</p>
          </div>
        ) : (
          <div className="approvals-list">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="approval-item">
                <div className="approval-info">
                  <div className="approval-kpi">{approval.kpi_name}</div>
                  <div className="approval-details">
                    <span className="approval-staff">
                      👤 {approval.user_name}
                    </span>
                    <span className="approval-value">
                      📊 Value: {approval.actual_value}
                    </span>
                    <span className="approval-date">
                      🕐 {getDaysPending(approval.submitted_at)} days ago
                    </span>
                  </div>
                </div>
                <div className="approval-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(approval)}
                  >
                    ✓ Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(approval)}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reject Submission</h3>
            <p>Please provide a reason for rejection:</p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
            <div className="modal-actions">
              <button onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button onClick={submitRejection} disabled={!rejectComment}>
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingApprovalsPanel;