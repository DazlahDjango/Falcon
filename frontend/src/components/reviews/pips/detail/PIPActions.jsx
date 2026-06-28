// src/components/reviews/pips/detail/PIPActions.jsx
import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle, RefreshCw, CalendarPlus } from 'lucide-react';
import { usePIP } from '../../../../hooks/reviews';
import { ReviewConfirmDialog } from '../../common';

const PIPActions = ({ pip, onAction }) => {
  const { approve, start, complete, extend, cancel, canManage } = usePIP();
  const [showConfirm, setShowConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [extendData, setExtendData] = useState({
    new_end_date: '',
    reason: '',
  });

  const handleAction = async (action, data = {}) => {
    setIsLoading(true);
    try {
      await action(pip.id, data);
      setShowConfirm(null);
      setShowExtend(false);
      onAction();
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!extendData.new_end_date || !extendData.reason) {
      alert('Please provide both new end date and reason');
      return;
    }
    setIsLoading(true);
    try {
      await extend(pip.id, extendData.new_end_date, extendData.reason);
      setShowExtend(false);
      onAction();
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = pip.status === 'draft' || pip.status === 'submitted';
  const isCompleted = pip.status === 'completed';

  const actions = [
    {
      key: 'approve',
      label: 'Approve',
      icon: <CheckCircle size={16} />,
      variant: 'success',
      show: pip.status === 'draft' && canManage,
      confirm: {
        title: 'Approve PIP',
        message: `Are you sure you want to approve this PIP for ${pip.employee_name}?`,
        variant: 'success',
      },
      action: () => handleAction(approve),
    },
    {
      key: 'start',
      label: 'Start',
      icon: <Clock size={16} />,
      variant: 'primary',
      show: pip.status === 'submitted' && canManage,
      confirm: {
        title: 'Start PIP',
        message: `Are you sure you want to start this PIP for ${pip.employee_name}?`,
        variant: 'primary',
      },
      action: () => handleAction(start),
    },
    {
      key: 'complete',
      label: 'Complete',
      icon: <CheckCircle size={16} />,
      variant: 'success',
      show: isActive && canManage,
      confirm: {
        title: 'Complete PIP',
        message: `Are you sure you want to complete this PIP for ${pip.employee_name}?`,
        variant: 'success',
      },
      action: () => handleAction(complete, { outcome: 'successful' }),
    },
    {
      key: 'extend',
      label: 'Extend',
      icon: <CalendarPlus size={16} />,
      variant: 'warning',
      show: isActive && canManage,
      action: () => setShowExtend(true),
    },
    {
      key: 'cancel',
      label: 'Cancel',
      icon: <XCircle size={16} />,
      variant: 'danger',
      show: (pip.status === 'draft' || pip.status === 'submitted') && canManage,
      confirm: {
        title: 'Cancel PIP',
        message: `Are you sure you want to cancel this PIP for ${pip.employee_name}?`,
        variant: 'danger',
      },
      action: () => handleAction(cancel),
    },
  ];

  const visibleActions = actions.filter((a) => a.show);

  return (
    <div className="pip-actions">
      <h3 className="pip-actions-title">Actions</h3>
      <div className="pip-actions-list">
        {visibleActions.map((action) => (
          <button
            key={action.key}
            className={`btn btn-${action.variant} pip-actions-btn`}
            onClick={() => action.confirm ? setShowConfirm(action) : action.action()}
            disabled={isLoading}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
        {visibleActions.length === 0 && (
          <p className="pip-actions-empty">No actions available</p>
        )}
      </div>

      {showExtend && (
        <div className="pip-actions-extend">
          <h4 className="pip-actions-extend-title">Extend PIP</h4>
          <div className="pip-actions-extend-group">
            <label className="pip-actions-extend-label">New End Date *</label>
            <input
              type="date"
              className="pip-actions-extend-input"
              value={extendData.new_end_date}
              onChange={(e) => setExtendData({ ...extendData, new_end_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="pip-actions-extend-group">
            <label className="pip-actions-extend-label">Reason *</label>
            <textarea
              className="pip-actions-extend-textarea"
              value={extendData.reason}
              onChange={(e) => setExtendData({ ...extendData, reason: e.target.value })}
              placeholder="Explain why the PIP needs to be extended..."
              rows={3}
            />
          </div>
          <div className="pip-actions-extend-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowExtend(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleExtend}
              disabled={!extendData.new_end_date || !extendData.reason || isLoading}
            >
              <CalendarPlus size={16} />
              Extend PIP
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <ReviewConfirmDialog
          isOpen={true}
          onClose={() => setShowConfirm(null)}
          onConfirm={() => showConfirm.action()}
          title={showConfirm.confirm.title}
          message={showConfirm.confirm.message}
          variant={showConfirm.confirm.variant}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default PIPActions;