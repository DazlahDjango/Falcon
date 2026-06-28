// src/components/reviews/promotions/detail/PromotionActions.jsx
import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Pause, Play, Save, TrendingUp } from 'lucide-react';
import { usePromotions } from '../../../../hooks/reviews';
import { ReviewConfirmDialog } from '../../common';

const PromotionActions = ({ promotion, onAction }) => {
  const { approve, reject, complete, hold, canManage } = usePromotions();
  const [showConfirm, setShowConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
    target_date: '',
    reason: '',
    actual_date: '',
    new_salary: '',
  });

  const handleAction = async (action, data = {}) => {
    setIsLoading(true);
    try {
      await action(promotion.id, data);
      setShowConfirm(null);
      setShowForm(false);
      onAction();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    if (!formData.target_date) {
      alert('Please provide a target promotion date');
      return;
    }
    setShowConfirm({
      title: 'Approve Promotion',
      message: `Are you sure you want to approve this promotion for ${promotion.employee_name}?`,
      variant: 'success',
      action: () => handleAction(approve, { notes: formData.notes, targetDate: formData.target_date }),
    });
  };

  const handleReject = () => {
    if (!formData.reason) {
      alert('Please provide a rejection reason');
      return;
    }
    setShowConfirm({
      title: 'Reject Promotion',
      message: `Are you sure you want to reject this promotion for ${promotion.employee_name}?`,
      variant: 'danger',
      action: () => handleAction(reject, { reason: formData.reason }),
    });
  };

  const handleComplete = () => {
    setShowConfirm({
      title: 'Complete Promotion',
      message: `Are you sure you want to mark this promotion as completed for ${promotion.employee_name}?`,
      variant: 'primary',
      action: () => handleAction(complete, { 
        actualDate: formData.actual_date || new Date().toISOString().split('T')[0],
        newSalary: formData.new_salary || null,
      }),
    });
  };

  const handleHold = () => {
    setShowConfirm({
      title: 'Hold Promotion',
      message: `Are you sure you want to put this promotion on hold for ${promotion.employee_name}?`,
      variant: 'warning',
      action: () => handleAction(hold, { reason: formData.reason }),
    });
  };

  const canApprove = promotion.status === 'pending' && canManage;
  const canReject = promotion.status === 'pending' && canManage;
  const canComplete = promotion.status === 'approved' && canManage;
  const canHold = (promotion.status === 'pending' || promotion.status === 'approved') && canManage;

  return (
    <div className="promotion-actions">
      <h3 className="promotion-actions-title">Actions</h3>

      {(canApprove || canReject || canComplete || canHold) && (
        <button
          className="promotion-actions-toggle"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hide Actions' : 'Show Actions'}
        </button>
      )}

      {showForm && (
        <div className="promotion-actions-form">
          {canApprove && (
            <>
              <div className="promotion-actions-group">
                <label className="promotion-actions-label">Target Promotion Date *</label>
                <input
                  type="date"
                  className="promotion-actions-input"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="promotion-actions-group">
                <label className="promotion-actions-label">Approval Notes</label>
                <textarea
                  className="promotion-actions-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add approval notes..."
                  rows={2}
                />
              </div>
              <button
                className="btn btn-success promotion-actions-btn"
                onClick={handleApprove}
                disabled={isLoading || !formData.target_date}
              >
                <CheckCircle size={18} />
                Approve
              </button>
            </>
          )}

          {canReject && (
            <>
              <div className="promotion-actions-group">
                <label className="promotion-actions-label">Rejection Reason *</label>
                <textarea
                  className="promotion-actions-textarea"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why this promotion is being rejected..."
                  rows={3}
                />
              </div>
              <button
                className="btn btn-danger promotion-actions-btn"
                onClick={handleReject}
                disabled={isLoading || !formData.reason}
              >
                <XCircle size={18} />
                Reject
              </button>
            </>
          )}

          {canComplete && (
            <>
              <div className="promotion-actions-group">
                <label className="promotion-actions-label">Actual Promotion Date</label>
                <input
                  type="date"
                  className="promotion-actions-input"
                  value={formData.actual_date}
                  onChange={(e) => setFormData({ ...formData, actual_date: e.target.value })}
                />
              </div>
              <div className="promotion-actions-group">
                <label className="promotion-actions-label">New Salary</label>
                <input
                  type="number"
                  className="promotion-actions-input"
                  value={formData.new_salary}
                  onChange={(e) => setFormData({ ...formData, new_salary: e.target.value })}
                  placeholder="Enter new salary"
                  min={0}
                  step={1000}
                />
              </div>
              <button
                className="btn btn-primary promotion-actions-btn"
                onClick={handleComplete}
                disabled={isLoading}
              >
                <CheckCircle size={18} />
                Complete
              </button>
            </>
          )}

          {canHold && (
            <>
              <div className="promotion-actions-group">
                <label className="promotion-actions-label">Hold Reason</label>
                <textarea
                  className="promotion-actions-textarea"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why this promotion is being put on hold..."
                  rows={2}
                />
              </div>
              <button
                className="btn btn-warning promotion-actions-btn"
                onClick={handleHold}
                disabled={isLoading}
              >
                <Pause size={18} />
                Hold
              </button>
            </>
          )}
        </div>
      )}

      {!canApprove && !canReject && !canComplete && !canHold && (
        <p className="promotion-actions-empty">No actions available</p>
      )}

      {showConfirm && (
        <ReviewConfirmDialog
          isOpen={true}
          onClose={() => setShowConfirm(null)}
          onConfirm={showConfirm.action}
          title={showConfirm.title}
          message={showConfirm.message}
          variant={showConfirm.variant}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default PromotionActions;