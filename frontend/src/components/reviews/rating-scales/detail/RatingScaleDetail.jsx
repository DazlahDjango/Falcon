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
  const { selected, loading, error, fetchOne, deleteRatingScale, canManage } = useRatingScales();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  const handleDelete = async () => {
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
                disabled={isDeleting}
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

          {selected.description && (
            <p className="rating-scale-detail-description">{selected.description}</p>
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