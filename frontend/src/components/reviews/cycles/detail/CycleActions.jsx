// src/components/reviews/cycles/detail/CycleActions.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, Archive, RefreshCw, CalendarPlus, AlertTriangle } from 'lucide-react';
import { useCycles } from '../../../../hooks/reviews';
import { ReviewConfirmDialog } from '../../common';

const CycleActions = ({ cycle }) => {
  const navigate = useNavigate();
  const { activate, freeze, complete, forceComplete, archive, unarchive, extend, canManage } = useCycles();
  const [showConfirm, setShowConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action, data = {}) => {
    setIsLoading(true);
    try {
      await action(cycle.id, data);
      setShowConfirm(null);
    } finally {
      setIsLoading(false);
    }
  };

  const canActivate = cycle.status === 'draft' && canManage;
  const canFreeze = cycle.status === 'active' && canManage;
  const canComplete = cycle.status === 'active' && canManage;
  const canArchive = (cycle.status === 'completed' || cycle.status === 'approved') && canManage;
  const canExtend = cycle.status === 'active' && canManage;

  const actions = [
    {
      key: 'activate',
      label: 'Activate',
      icon: <Play size={16} />,
      variant: 'success',
      show: canActivate,
      confirm: {
        title: 'Activate Cycle',
        message: `Are you sure you want to activate "${cycle.name}"? This will start the review process.`,
        variant: 'success',
      },
      action: () => handleAction(activate),
    },
    {
      key: 'freeze',
      label: 'Freeze',
      icon: <Square size={16} />,
      variant: 'warning',
      show: canFreeze,
      confirm: {
        title: 'Freeze Cycle',
        message: `Are you sure you want to freeze "${cycle.name}"? This will pause the review process.`,
        variant: 'warning',
      },
      action: () => handleAction(freeze),
    },
    {
      key: 'complete',
      label: 'Complete',
      icon: <CheckCircle size={16} />,
      variant: 'primary',
      show: canComplete,
      confirm: {
        title: 'Complete Cycle',
        message: `Are you sure you want to complete "${cycle.name}"? This action cannot be undone.`,
        variant: 'primary',
      },
      action: () => handleAction(complete),
    },
    {
      key: 'force_complete',
      label: 'Force Complete',
      icon: <AlertTriangle size={16} />,
      variant: 'danger',
      show: canManage && cycle.status === 'active',
      confirm: {
        title: 'Force Complete Cycle',
        message: `Are you sure you want to force complete "${cycle.name}"? This will bypass any remaining reviews and cannot be undone.`,
        variant: 'danger',
      },
      action: () => handleAction(forceComplete),
    },
    {
      key: 'archive',
      label: 'Archive',
      icon: <Archive size={16} />,
      variant: 'secondary',
      show: canArchive,
      confirm: {
        title: 'Archive Cycle',
        message: `Are you sure you want to archive "${cycle.name}"?`,
        variant: 'secondary',
      },
      action: () => handleAction(archive),
    },
    {
      key: 'extend',
      label: 'Extend',
      icon: <CalendarPlus size={16} />,
      variant: 'primary',
      show: canExtend,
      action: () => navigate(`/reviews/cycles/${cycle.id}/extend`),
    },
  ];

  const visibleActions = actions.filter((a) => a.show);

  if (visibleActions.length === 0) return null;

  return (
    <div className="cycle-actions">
      <h3 className="cycle-actions-title">Actions</h3>
      <div className="cycle-actions-list">
        {visibleActions.map((action) => (
          <button
            key={action.key}
            className={`btn btn-${action.variant} cycle-actions-btn`}
            onClick={() => action.confirm ? setShowConfirm(action) : action.action()}
            disabled={isLoading}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

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

export default CycleActions;