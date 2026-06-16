// src/components/reviews/cycles/detail/CycleDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useCycles } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import CycleInfo from './CycleInfo';
import CycleProgress from './CycleProgress';
import CycleParticipants from './CycleParticipants';
import CycleSummary from './CycleSummary';
import CycleActions from './CycleActions';

const CycleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, deleteCycle, getProgress, getParticipants, getSummary, canManage } = useCycles();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOne(id);
      getProgress(id);
      getParticipants(id);
      getSummary(id);
    }
  }, [id, fetchOne, getProgress, getParticipants, getSummary]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selected?.name}"?`)) {
      setIsDeleting(true);
      try {
        await deleteCycle(id);
        navigate('/reviews/cycles');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchOne(id);
      getProgress(id);
      getParticipants(id);
      getSummary(id);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading review cycle..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="cycle-detail">
      <div className="cycle-detail-header">
        <button className="cycle-detail-back" onClick={() => navigate('/reviews/cycles')}>
          <ArrowLeft size={20} />
          Back to Cycles
        </button>
        <div className="cycle-detail-actions">
          <button className="cycle-detail-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          {canManage && (
            <>
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/reviews/cycles/${id}/edit`)}
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

      <div className="cycle-detail-content">
        <div className="cycle-detail-main">
          <div className="cycle-detail-title-section">
            <h1 className="cycle-detail-title">{selected.name}</h1>
            <ReviewStatusBadge status={selected.status} size="lg" />
          </div>

          {selected.description && (
            <p className="cycle-detail-description">{selected.description}</p>
          )}

          <div className="cycle-detail-grid">
            <CycleInfo cycle={selected} />
            <CycleActions cycle={selected} />
          </div>

          <CycleProgress cycleId={id} />
          
          <div className="cycle-detail-grid-2">
            <CycleParticipants cycleId={id} />
            <CycleSummary cycleId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleDetail;