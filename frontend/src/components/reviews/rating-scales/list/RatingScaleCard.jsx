// src/components/reviews/rating-scales/list/RatingScaleCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Star, CheckCircle, XCircle, Eye } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useRatingScales } from '../../../../hooks/reviews';

const RatingScaleCard = ({ scale }) => {
  const navigate = useNavigate();
  const { deleteRatingScale, canManage } = useRatingScales();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${scale.name}"?`)) {
      await deleteRatingScale(scale.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/reviews/rating-scales/${scale.id}/edit`);
  };

  const handleView = () => {
    navigate(`/reviews/rating-scales/${scale.id}`);
  };

  const levelCount = scale.levels?.length || 0;
  const isDefault = scale.is_default;
  const isActive = scale.is_active;

  return (
    <div className="rating-scale-card" onClick={handleView}>
      <div className="rating-scale-card-header">
        <div className="rating-scale-card-title-section">
          <h3 className="rating-scale-card-title">{scale.name}</h3>
          <div className="rating-scale-card-badges">
            {isDefault && (
              <span className="badge badge-primary badge-sm">Default</span>
            )}
            <ReviewStatusBadge status={isActive ? 'active' : 'inactive'} />
          </div>
        </div>
        <div className="rating-scale-card-actions">
          {canManage && (
            <>
              <button
                className="rating-scale-card-action-btn"
                onClick={handleEdit}
                aria-label="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                className="rating-scale-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            className="rating-scale-card-action-btn"
            onClick={handleView}
            aria-label="View"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {scale.description && (
        <p className="rating-scale-card-description">{scale.description}</p>
      )}

      <div className="rating-scale-card-stats">
        <div className="rating-scale-card-stat">
          <span className="rating-scale-card-stat-label">Levels</span>
          <span className="rating-scale-card-stat-value">{levelCount}</span>
        </div>
        <div className="rating-scale-card-stat">
          <span className="rating-scale-card-stat-label">Range</span>
          <span className="rating-scale-card-stat-value">
            {scale.min_value} - {scale.max_value}
          </span>
        </div>
        <div className="rating-scale-card-stat">
          <span className="rating-scale-card-stat-label">Usage</span>
          <span className="rating-scale-card-stat-value">{scale.usage_count || 0}</span>
        </div>
      </div>

      {scale.levels && scale.levels.length > 0 && (
        <div className="rating-scale-card-levels">
          {scale.levels.slice(0, 4).map((level, index) => (
            <div
              key={index}
              className="rating-scale-card-level"
              style={{ backgroundColor: level.color || '#e5e7eb' }}
            >
              <span className="rating-scale-card-level-label">{level.label}</span>
            </div>
          ))}
          {scale.levels.length > 4 && (
            <div className="rating-scale-card-level-more">
              +{scale.levels.length - 4}
            </div>
          )}
        </div>
      )}

      <div className="rating-scale-card-footer">
        <span className="rating-scale-card-date">
          Updated {new Date(scale.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default RatingScaleCard;