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

  const isUsed = (selected?.usage_count > 0) || (usageStats?.total_ratings > 0);

  const handleDelete = async () => {
    if (isUsed) {
      alert('Cannot delete a competency that is currently in use.');
      return;
    }
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
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isUsed}
                title={isUsed ? 'Competency is in use and cannot be deleted' : 'Delete Competency'}
              >
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

        {isUsed && (
          <div className="alert alert-warning mt-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            ⚠️ This competency is currently in use by {selected.usage_count || usageStats?.total_ratings} rating(s) in review cycles. Scoring parameters (weight, type, rating scale) are locked to protect ongoing evaluations.
          </div>
        )}

        {selected.description && (
          <p className="competency-detail-description mt-3">{selected.description}</p>
        )}

        <div className="competency-detail-grid">
          <CompetencyInfo competency={selected} />
          <CompetencyUsageStats stats={usageStats} />
        </div>

        {(selected.excellent_behavior || selected.needs_improvement_behavior) && (
          <div className="competency-detail-behaviors">
            <h3 className="competency-behaviors-title">Behavioral Indicators</h3>
            <div className="competency-behaviors-grid">
              {selected.excellent_behavior && (
                <div className="behavior-card excellent">
                  <h4>🌟 Excellent Performance</h4>
                  <p>{selected.excellent_behavior}</p>
                </div>
              )}
              {selected.needs_improvement_behavior && (
                <div className="behavior-card improvement">
                  <h4>⚠️ Needs Improvement</h4>
                  <p>{selected.needs_improvement_behavior}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetencyDetail;