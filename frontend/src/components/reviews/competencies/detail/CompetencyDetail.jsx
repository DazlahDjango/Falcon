// src/components/reviews/competencies/detail/CompetencyDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useCompetencies } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import CompetencyInfo from './CompetencyInfo';
import CompetencyUsageStats from './CompetencyUsageStats';

const CompetencyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, getUsageStats, usageStats, deleteCompetency, canManage } = useCompetencies();

  useEffect(() => {
    if (id) {
      fetchOne(id);
      getUsageStats(id);
    }
  }, [id, fetchOne, getUsageStats]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selected?.name}"?`)) {
      await deleteCompetency(id);
      navigate('/reviews/competencies');
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchOne(id);
      getUsageStats(id);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading competency..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="competency-detail">
      <div className="competency-detail-header">
        <button className="competency-detail-back" onClick={() => navigate('/reviews/competencies')}>
          <ArrowLeft size={20} />
          Back to Competencies
        </button>
        <div className="competency-detail-actions">
          <button className="competency-detail-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          {canManage && (
            <>
              <button className="btn btn-primary" onClick={() => navigate(`/reviews/competencies/${id}/edit`)}>
                <Edit size={18} />
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="competency-detail-content">
        <div className="competency-detail-title-section">
          <h1 className="competency-detail-title">{selected.name}</h1>
          <div className="competency-detail-badges">
            <ReviewStatusBadge status={selected.is_active ? 'active' : 'inactive'} size="lg" />
            {selected.is_required && (
              <span className="competency-detail-required">Required</span>
            )}
          </div>
        </div>

        {selected.description && (
          <p className="competency-detail-description">{selected.description}</p>
        )}

        <div className="competency-detail-grid">
          <CompetencyInfo competency={selected} />
          <CompetencyUsageStats stats={usageStats} />
        </div>
      </div>
    </div>
  );
};

export default CompetencyDetail;