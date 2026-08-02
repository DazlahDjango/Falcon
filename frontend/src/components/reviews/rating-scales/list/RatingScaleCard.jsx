// src/components/reviews/rating-scales/list/RatingScaleCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Star, CheckCircle, XCircle, Eye, Copy } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useRatingScales } from '../../../../hooks/reviews';

const RatingScaleCard = ({ scale }) => {
  const navigate = useNavigate();
  const { deleteRatingScale, cloneScale, setDefault, activate, deactivate, canManage } = useRatingScales();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (scale.is_default) {
      alert('Cannot delete the default rating scale.');
      return;
    }
    if (scale.usage_count > 0) {
      alert('Cannot delete a rating scale that is currently in use.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${scale.name}"?`)) {
      await deleteRatingScale(scale.id);
    }
  };

  const handleClone = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to clone "${scale.name}"?`)) {
      try {
        await cloneScale(scale.id);
      } catch (err) {
        console.error('Failed to clone rating scale:', err);
      }
    }
  };

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    try {
      if (scale.is_active) {
        if (scale.is_default) {
          alert('Cannot deactivate the default rating scale.');
          return;
        }
        await deactivate(scale.id);
      } else {
        await activate(scale.id);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleSetDefault = async (e) => {
    e.stopPropagation();
    if (!scale.is_active) {
      alert('Only active rating scales can be set as default.');
      return;
    }
    try {
      await setDefault(scale.id);
    } catch (err) {
      console.error('Failed to set default scale:', err);
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
          <div className="rating-scale-card-badges flex items-center gap-2">
            {isDefault && (
               <span className="badge badge-primary badge-sm">Default</span>
            )}
            {canManage ? (
              <label className="flex items-center gap-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isActive}
                  disabled={isDefault}
                  onChange={handleToggleActive}
                  className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                  title={isDefault ? 'Cannot deactivate the default scale' : 'Toggle active status'}
                />
                <span className={`text-xs ${isActive ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            ) : (
              <ReviewStatusBadge status={isActive ? 'active' : 'inactive'} />
            )}
          </div>
        </div>
        <div className="rating-scale-card-actions">
          {canManage && (
            <>
              {!isDefault && isActive && (
                <button
                  className="rating-scale-card-action-btn"
                  onClick={handleSetDefault}
                  aria-label="Set Default"
                  title="Set as Default Scale"
                >
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                </button>
              )}
              <button
                className="rating-scale-card-action-btn"
                onClick={handleClone}
                aria-label="Clone"
                title="Clone Rating Scale"
              >
                <Copy size={16} />
              </button>
              <button
                className="rating-scale-card-action-btn"
                onClick={handleEdit}
                aria-label="Edit"
                title="Edit Rating Scale"
              >
                <Edit size={16} />
              </button>
              <button
                className="rating-scale-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
                disabled={isDefault || scale.usage_count > 0}
                title={
                  isDefault
                    ? 'Cannot delete the default scale'
                    : scale.usage_count > 0
                    ? 'Scale is in use and cannot be deleted'
                    : 'Delete Rating Scale'
                }
                style={{
                  opacity: (isDefault || scale.usage_count > 0) ? 0.4 : 1,
                  cursor: (isDefault || scale.usage_count > 0) ? 'not-allowed' : 'pointer'
                }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            className="rating-scale-card-action-btn"
            onClick={handleView}
            aria-label="View"
            title="View Details"
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