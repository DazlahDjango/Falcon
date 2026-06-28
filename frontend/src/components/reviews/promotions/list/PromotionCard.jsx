// src/components/reviews/promotions/list/PromotionCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, TrendingUp, Award, User, Calendar, DollarSign } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { usePromotions } from '../../../../hooks/reviews';

const PromotionCard = ({ promotion }) => {
  const navigate = useNavigate();
  const { deletePromotion, canManage } = usePromotions();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete promotion for "${promotion.employee_name}"?`)) {
      await deletePromotion(promotion.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/reviews/promotions/${promotion.id}/edit`);
  };

  const handleView = () => {
    navigate(`/reviews/promotions/${promotion.id}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="promotion-card" onClick={handleView}>
      <div className="promotion-card-header">
        <div className="promotion-card-title-section">
          <div className="promotion-card-employee">
            <div className="promotion-card-avatar">
              {promotion.employee_name?.charAt(0) || 'E'}
            </div>
            <div>
              <h3 className="promotion-card-title">{promotion.employee_name}</h3>
              <span className="promotion-card-role">{promotion.current_role}</span>
            </div>
          </div>
          <div className="promotion-card-badges">
            <ReviewStatusBadge status={promotion.status} />
            <span
              className="promotion-card-priority"
              style={{ backgroundColor: getPriorityColor(promotion.priority) }}
            >
              {promotion.priority}
            </span>
          </div>
        </div>
        <div className="promotion-card-actions">
          {canManage && (
            <>
              <button
                className="promotion-card-action-btn"
                onClick={handleEdit}
                aria-label="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                className="promotion-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            className="promotion-card-action-btn"
            onClick={handleView}
            aria-label="View"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      <div className="promotion-card-details">
        <div className="promotion-card-detail">
          <TrendingUp size={16} />
          <span>
            {promotion.current_role} → {promotion.recommended_role}
          </span>
        </div>
        <div className="promotion-card-detail">
          <Calendar size={16} />
          <span>Recommended: {formatDate(promotion.recommended_date)}</span>
        </div>
        {promotion.proposed_salary && (
          <div className="promotion-card-detail">
            <DollarSign size={16} />
            <span>${promotion.proposed_salary.toLocaleString()}</span>
          </div>
        )}
        <div className="promotion-card-detail">
          <User size={16} />
          <span>By: {promotion.recommended_by_name || 'Unknown'}</span>
        </div>
      </div>

      {promotion.justification && (
        <p className="promotion-card-justification">{promotion.justification}</p>
      )}

      <div className="promotion-card-footer">
        {promotion.days_pending !== null && promotion.status === 'pending' && (
          <span className="promotion-card-pending">
            Pending for {promotion.days_pending} days
          </span>
        )}
        {promotion.status === 'approved' && promotion.target_promotion_date && (
          <span className="promotion-card-target">
            Target: {formatDate(promotion.target_promotion_date)}
          </span>
        )}
        {promotion.status === 'completed' && promotion.actual_promotion_date && (
          <span className="promotion-card-completed">
            Completed: {formatDate(promotion.actual_promotion_date)}
          </span>
        )}
      </div>
    </div>
  );
};

export default PromotionCard;