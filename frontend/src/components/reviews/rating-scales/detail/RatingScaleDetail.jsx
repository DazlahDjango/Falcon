// src/components/reviews/rating-scales/detail/RatingScaleDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Star } from 'lucide-react';
import { useRatingScales } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import RatingScaleInfo from './RatingScaleInfo';
import RatingScaleLevels from './RatingScaleLevels';

const RatingScaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selected,
    loading,
    error,
    fetchOne,
    deleteRatingScale,
    setDefault,
    activate,
    deactivate,
    canManage
  } = useRatingScales();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  const handleDelete = async () => {
    if (selected?.is_default) {
      alert('Cannot delete the default rating scale.');
      return;
    }
    if (selected?.usage_count > 0) {
      alert('Cannot delete a rating scale that is currently in use.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${selected?.name}"?`)) {
      setIsDeleting(true);
      try {
        await deleteRatingScale(id);
        navigate('/reviews/rating-scales');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleActive = async () => {
    if (!selected) return;
    setIsActionPending(true);
    try {
      if (selected.is_active) {
        if (selected.is_default) {
          alert('Cannot deactivate the default rating scale.');
          return;
        }
        await deactivate(id);
      } else {
        await activate(id);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleSetDefault = async () => {
    if (!selected) return;
    if (!selected.is_active) {
      alert('Only active rating scales can be set as default.');
      return;
    }
    setIsActionPending(true);
    try {
      await setDefault(id);
    } catch (err) {
      console.error('Failed to set default scale:', err);
    } finally {
      setIsActionPending(false);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading rating scale..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="rating-scale-detail">
      <div className="rating-scale-detail-header">
        <button className="rating-scale-detail-back" onClick={() => navigate('/reviews/rating-scales')}>
          <ArrowLeft size={20} />
          Back to Rating Scales
        </button>
        <div className="rating-scale-detail-actions">
          {canManage && (
            <>
              {!selected.is_default && selected.is_active && (
                <button
                  className="btn btn-outline flex items-center gap-1"
                  onClick={handleSetDefault}
                  disabled={isActionPending}
                >
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  Set Default
                </button>
              )}
              <button
                className={`btn ${selected.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                onClick={handleToggleActive}
                disabled={isActionPending || (selected.is_active && selected.is_default)}
                title={selected.is_default ? 'Cannot deactivate the default scale' : ''}
              >
                {selected.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/reviews/rating-scales/${id}/edit`)}
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting || selected.is_default || selected.usage_count > 0}
                title={
                  selected.is_default
                    ? 'Cannot delete the default scale'
                    : selected.usage_count > 0
                    ? 'Scale is in use and cannot be deleted'
                    : ''
                }
              >
                <Trash2 size={18} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rating-scale-detail-content">
        <div className="rating-scale-detail-main">
          <div className="rating-scale-detail-title-section">
            <h1 className="rating-scale-detail-title">{selected.name}</h1>
            <div className="rating-scale-detail-badges">
              {selected.is_default && (
                <span className="badge badge-primary">
                  <Star size={14} /> Default
                </span>
              )}
              <ReviewStatusBadge status={selected.is_active ? 'active' : 'inactive'} size="lg" />
            </div>
          </div>

          {selected.is_default && (
            <div className="alert alert-info mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
              💡 This is the default rating scale. It cannot be deleted or deactivated.
            </div>
          )}

          {selected.usage_count > 0 && (
            <div className="alert alert-warning mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
              ⚠️ This rating scale is currently in use by {selected.usage_count} review cycle(s). Ranges and level values are locked to protect ongoing evaluations.
            </div>
          )}

          {selected.description && (
            <p className="rating-scale-detail-description mt-3">{selected.description}</p>
          )}

          <div className="rating-scale-detail-grid">
            <RatingScaleInfo scale={selected} />
            <RatingScaleLevels levels={selected.levels} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingScaleDetail;