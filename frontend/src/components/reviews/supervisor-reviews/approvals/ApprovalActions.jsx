// src/components/reviews/supervisor-reviews/approvals/ApprovalActions.jsx
import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Send, AlertCircle } from 'lucide-react';
import { ReviewConfirmDialog } from '../../common';

const ApprovalActions = ({ review, onApprove, onReject, onRequestChanges, onClose }) => {
  const [action, setAction] = useState(null);
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
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

  const handleRequestChanges = async () => {
    setIsLoading(true);
    try {
      if (onRequestChanges) {
        await onRequestChanges(review.id, feedback);
      }
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
    } else if (action === 'request_changes') {
      if (!feedback.trim()) {
        alert('Please provide change feedback for the supervisor');
        return;
      }
      setShowConfirm(true);
    }
  };

  const getConfirmHandler = () => {
    if (action === 'approve') return handleApprove;
    if (action === 'reject') return handleReject;
    return handleRequestChanges;
  };

  const getConfirmTitle = () => {
    if (action === 'approve') return 'Approve Review';
    if (action === 'reject') return 'Reject Review';
    return 'Request Changes';
  };

  const getConfirmMessage = () => {
    if (action === 'approve') return `Are you sure you want to approve this review for ${review.employee_name}?`;
    if (action === 'reject') return `Are you sure you want to reject this review for ${review.employee_name}? This will require the supervisor to revise and resubmit.`;
    return `Are you sure you want to request changes for ${review.employee_name}'s review? The review will return to draft for the supervisor to edit.`;
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

          <div className="approval-actions-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <button
              className={`approval-actions-option ${action === 'approve' ? 'active approve' : ''}`}
              onClick={() => setAction('approve')}
            >
              <CheckCircle size={22} />
              <span>Approve</span>
            </button>
            <button
              className={`approval-actions-option ${action === 'request_changes' ? 'active warning' : ''}`}
              onClick={() => setAction('request_changes')}
            >
              <AlertCircle size={22} />
              <span>Request Changes</span>
            </button>
            <button
              className={`approval-actions-option ${action === 'reject' ? 'active reject' : ''}`}
              onClick={() => setAction('reject')}
            >
              <XCircle size={22} />
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

          {action === 'request_changes' && (
            <div className="approval-actions-reason">
              <label className="approval-actions-label">Change Feedback *</label>
              <textarea
                className="approval-actions-textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Specify the changes the supervisor needs to make..."
                rows={4}
                required
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
            className={`btn ${action === 'approve' ? 'btn-success' : action === 'request_changes' ? 'btn-warning' : 'btn-danger'}`}
            onClick={handleSubmit}
            disabled={!action || (action === 'reject' && !reason.trim()) || (action === 'request_changes' && !feedback.trim())}
          >
            {action === 'approve' ? (
              <>
                <CheckCircle size={16} />
                Approve Review
              </>
            ) : action === 'request_changes' ? (
              <>
                <AlertCircle size={16} />
                Request Changes
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
            onConfirm={getConfirmHandler()}
            title={getConfirmTitle()}
            message={getConfirmMessage()}
            variant={action === 'approve' ? 'success' : action === 'request_changes' ? 'warning' : 'danger'}
            confirmText={action === 'approve' ? 'Approve' : action === 'request_changes' ? 'Request Changes' : 'Reject'}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ApprovalActions;