// src/components/reviews/final-ratings/detail/FinalRatingActions.jsx
import React, { useState } from 'react';
import { CheckCircle, Lock, RefreshCw, Award, AlertTriangle, TrendingUp } from 'lucide-react';
import { useFinalRating } from '../../../../hooks/reviews';
import { ReviewConfirmDialog } from '../../common';

const FinalRatingActions = ({ rating, onAction }) => {
  const { approve, lock, forceLock, generatePIP, generatePromotion, canManage } = useFinalRating();
  const [showConfirm, setShowConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action, data = {}) => {
    setIsLoading(true);
    try {
      await action(rating.id, data);
      setShowConfirm(null);
      onAction();
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    {
      key: 'approve',
      label: 'Approve',
      icon: <CheckCircle size={16} />,
      variant: 'success',
      show: rating.status === 'calibrated' || rating.status === 'pending',
      confirm: {
        title: 'Approve Rating',
        message: `Are you sure you want to approve this rating for ${rating.employee_name}?`,
        variant: 'success',
      },
      action: () => handleAction(approve),
    },
    {
      key: 'lock',
      label: 'Lock',
      icon: <Lock size={16} />,
      variant: 'primary',
      show: rating.status === 'approved',
      confirm: {
        title: 'Lock Rating',
        message: `Are you sure you want to lock this rating for ${rating.employee_name}? This action cannot be undone.`,
        variant: 'primary',
      },
      action: () => handleAction(lock),
    },
    {
      key: 'force_lock',
      label: 'Force Lock',
      icon: <Lock size={16} />,
      variant: 'warning',
      show: canManage && (rating.status === 'pending' || rating.status === 'calibrated'),
      confirm: {
        title: 'Force Lock Rating',
        message: `Are you sure you want to force lock this rating for ${rating.employee_name}? This will bypass approval.`,
        variant: 'warning',
      },
      action: () => handleAction(forceLock),
    },
    {
      key: 'generate_pip',
      label: 'Generate PIP',
      icon: <AlertTriangle size={16} />,
      variant: 'danger',
      show: canManage && rating.final_score < 60 && rating.status === 'locked',
      confirm: {
        title: 'Generate PIP',
        message: `Are you sure you want to generate a Performance Improvement Plan for ${rating.employee_name}?`,
        variant: 'danger',
      },
      action: () => handleAction(generatePIP),
    },
    {
      key: 'generate_promotion',
      label: 'Generate Promotion',
      icon: <TrendingUp size={16} />,
      variant: 'success',
      show: canManage && rating.promotion_recommended && rating.status === 'locked',
      confirm: {
        title: 'Generate Promotion',
        message: `Are you sure you want to generate a promotion recommendation for ${rating.employee_name}?`,
        variant: 'success',
      },
      action: () => handleAction(generatePromotion),
    },
  ];

  const visibleActions = actions.filter((a) => a.show);

  if (visibleActions.length === 0) {
    return (
      <div className="final-rating-actions">
        <h3 className="final-rating-actions-title">Actions</h3>
        <p className="final-rating-actions-empty">No actions available</p>
      </div>
    );
  }

  return (
    <div className="final-rating-actions">
      <h3 className="final-rating-actions-title">Actions</h3>
      <div className="final-rating-actions-list">
        {visibleActions.map((action) => (
          <button
            key={action.key}
            className={`btn btn-${action.variant} final-rating-actions-btn`}
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

export default FinalRatingActions;