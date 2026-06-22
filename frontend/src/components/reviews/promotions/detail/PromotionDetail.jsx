// src/components/reviews/promotions/detail/PromotionDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw, Printer } from 'lucide-react';
import { usePromotions } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import PromotionInfo from './PromotionInfo';
import PromotionActions from './PromotionActions';

const PromotionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, deletePromotion, canManage } = usePromotions();

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this promotion for "${selected?.employee_name}"?`)) {
      await deletePromotion(id);
      navigate('/reviews/promotions');
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchOne(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <ReviewLoading size="lg" text="Loading promotion..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="promotion-detail">
      <div className="promotion-detail-header">
        <button className="promotion-detail-back" onClick={() => navigate('/reviews/promotions')}>
          <ArrowLeft size={20} />
          Back to Promotions
        </button>
        <div className="promotion-detail-actions">
          <button className="promotion-detail-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          {canManage && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/reviews/promotions/${id}/edit`)}
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="promotion-detail-content">
        <div className="promotion-detail-top">
          <div className="promotion-detail-title-section">
            <h1 className="promotion-detail-title">Promotion Recommendation</h1>
            <div className="promotion-detail-badges">
              <ReviewStatusBadge status={selected.status} size="lg" />
              <span
                className="promotion-detail-priority"
                style={{
                  backgroundColor: {
                    high: '#ef4444',
                    medium: '#f59e0b',
                    low: '#22c55e',
                  }[selected.priority] || '#6b7280',
                }}
              >
                {selected.priority}
              </span>
            </div>
          </div>
        </div>

        <div className="promotion-detail-grid">
          <div className="promotion-detail-main">
            <PromotionInfo promotion={selected} />
          </div>
          <div className="promotion-detail-sidebar">
            <PromotionActions promotion={selected} onAction={handleRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetail;