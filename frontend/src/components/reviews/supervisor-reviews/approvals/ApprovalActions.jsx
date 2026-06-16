// src/components/reviews/supervisor-reviews/approvals/ApprovalActions.jsx
import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Send, AlertCircle } from 'lucide-react';
import { ReviewConfirmDialog } from '../../common';

const ApprovalActions = ({ review, onApprove, onReject, onClose }) => {
  const [action, setAction] = useState(null);
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove(review.id, comments);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await onReject(review.id, reason);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (action === 'approve') {
      setShowConfirm(true);
    } else if (action === 'reject') {
      if (!reason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      setShowConfirm(true);
    }
  };

  return (
    <div className="approval-actions-overlay" onClick={onClose}>
      <div className="approval-actions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="approval-actions-header">
          <h3 className="approval-actions-title">Review Approval</h3>
          <button className="approval-actions-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="approval-actions-body">
          <div className="approval-actions-review-info">
            <div className="approval-actions-review-employee">
              <span className="approval-actions-review-label">Employee</span>
              <span className="approval-actions-review-value">{review.employee_name}</span>
            </div>
            <div className="approval-actions-review-supervisor">
              <span className="approval-actions-review-label">Supervisor</span>
              <span className="approval-actions-review-value">{review.supervisor_name}</span>
            </div>
            <div className="approval-actions-review-cycle">
              <span className="approval-actions-review-label">Cycle</span>
              <span className="approval-actions-review-value">{review.review_cycle_name}</span>
            </div>
          </div>

          <div className="approval-actions-options">
            <button
              className={`approval-actions-option ${action === 'approve' ? 'active approve' : ''}`}
              onClick={() => setAction('approve')}
            >
              <CheckCircle size={24} />
              <span>Approve</span>
            </button>
            <button
              className={`approval-actions-option ${action === 'reject' ? 'active reject' : ''}`}
              onClick={() => setAction('reject')}
            >
              <XCircle size={24} />
              <span>Reject</span>
            </button>
          </div>

          {action === 'approve' && (
            <div className="approval-actions-comment">
              <label className="approval-actions-label">Approval Comments (Optional)</label>
              <textarea
                className="approval-actions-textarea"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments about this approval..."
                rows={3}
              />
            </div>
          )}

          {action === 'reject' && (
            <div className="approval-actions-reason">
              <label className="approval-actions-label">Rejection Reason *</label>
              <textarea
                className="approval-actions-textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this review is being rejected..."
                rows={4}
                required
              />
            </div>
          )}
        </div>

        <div className="approval-actions-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
            onClick={handleSubmit}
            disabled={!action || (action === 'reject' && !reason.trim())}
          >
            {action === 'approve' ? (
              <>
                <CheckCircle size={16} />
                Approve Review
              </>
            ) : action === 'reject' ? (
              <>
                <XCircle size={16} />
                Reject Review
              </>
            ) : (
              'Select Action'
            )}
          </button>
        </div>

        {showConfirm && (
          <ReviewConfirmDialog
            isOpen={true}
            onClose={() => setShowConfirm(false)}
            onConfirm={action === 'approve' ? handleApprove : handleReject}
            title={action === 'approve' ? 'Approve Review' : 'Reject Review'}
            message={
              action === 'approve'
                ? `Are you sure you want to approve this review for ${review.employee_name}?`
                : `Are you sure you want to reject this review for ${review.employee_name}? This will require the supervisor to revise and resubmit.`
            }
            variant={action === 'approve' ? 'success' : 'danger'}
            confirmText={action === 'approve' ? 'Approve' : 'Reject'}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ApprovalActions;