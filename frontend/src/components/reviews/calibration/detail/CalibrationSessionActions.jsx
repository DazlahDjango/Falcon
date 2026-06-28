// src/components/reviews/calibration/detail/CalibrationSessionActions.jsx
import React, { useState } from 'react';
import { Play, Square, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useCalibration } from '../../../../hooks/reviews';
import { ReviewConfirmDialog } from '../../common';

const CalibrationSessionActions = ({ session, onAction }) => {
  const { startSession, completeSession, cancelSession, canManage } = useCalibration();
  const [showConfirm, setShowConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeData, setCompleteData] = useState({
    decisions: '',
    notes: '',
  });

  const handleAction = async (action, data = {}) => {
    setIsLoading(true);
    try {
      await action(session.id, data);
      setShowConfirm(null);
      setShowCompleteForm(false);
      onAction();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    setShowConfirm({
      title: 'Start Session',
      message: `Are you sure you want to start "${session.name}"?`,
      variant: 'success',
      action: () => handleAction(startSession),
    });
  };

  const handleComplete = () => {
    if (!completeData.decisions && !completeData.notes) {
      alert('Please provide decisions or notes to complete the session');
      return;
    }
    setShowConfirm({
      title: 'Complete Session',
      message: `Are you sure you want to complete "${session.name}"?`,
      variant: 'primary',
      action: () => handleAction(completeSession, completeData),
    });
  };

  const handleCancel = () => {
    setShowConfirm({
      title: 'Cancel Session',
      message: `Are you sure you want to cancel "${session.name}"?`,
      variant: 'danger',
      action: () => handleAction(cancelSession),
    });
  };

  const canStart = session.status === 'draft' && canManage;
  const canComplete = session.status === 'under_review' && canManage;
  const canCancel = (session.status === 'draft' || session.status === 'under_review') && canManage;

  return (
    <div className="calibration-session-actions">
      <h3 className="calibration-session-actions-title">Actions</h3>
      
      {canStart && (
        <button className="btn btn-success calibration-session-actions-btn" onClick={handleStart} disabled={isLoading}>
          <Play size={18} />
          Start Session
        </button>
      )}

      {canComplete && (
        <>
          <button className="btn btn-primary calibration-session-actions-btn" onClick={() => setShowCompleteForm(!showCompleteForm)}>
            <CheckCircle size={18} />
            Complete Session
          </button>
          
          {showCompleteForm && (
            <div className="calibration-session-actions-form">
              <div className="calibration-session-actions-form-group">
                <label className="calibration-session-actions-form-label">Decisions</label>
                <textarea
                  className="calibration-session-actions-form-textarea"
                  value={completeData.decisions}
                  onChange={(e) => setCompleteData({ ...completeData, decisions: e.target.value })}
                  placeholder="Record the decisions made..."
                  rows={3}
                />
              </div>
              <div className="calibration-session-actions-form-group">
                <label className="calibration-session-actions-form-label">Notes</label>
                <textarea
                  className="calibration-session-actions-form-textarea"
                  value={completeData.notes}
                  onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <div className="calibration-session-actions-form-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowCompleteForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  <CheckCircle size={16} />
                  Complete
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {canCancel && (
        <button className="btn btn-danger calibration-session-actions-btn" onClick={handleCancel} disabled={isLoading}>
          <X size={18} />
          Cancel Session
        </button>
      )}

      {!canStart && !canComplete && !canCancel && (
        <p className="calibration-session-actions-empty">No actions available</p>
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

export default CalibrationSessionActions;