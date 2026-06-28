// src/components/reviews/supervisor-reviews/detail/SupervisorReviewDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Printer, User } from 'lucide-react';
import { useSupervisorReview } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import SupervisorReviewView from './SupervisorReviewView';
import CompetencyComparison from './CompetencyComparison';

const SupervisorReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, compare, comparison, canManage } = useSupervisorReview();

  useEffect(() => {
    if (id) {
      fetchOne(id);
      compare(id);
    }
  }, [id, fetchOne, compare]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <ReviewLoading size="lg" text="Loading supervisor review..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="supervisor-review-detail">
      <div className="supervisor-review-detail-header">
        <button className="supervisor-review-detail-back" onClick={() => navigate('/reviews/supervisor-reviews/queue')}>
          <ArrowLeft size={20} />
          Back to Queue
        </button>
        <div className="supervisor-review-detail-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          {canManage && selected.status === 'draft' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/reviews/supervisor-reviews/${selected.employee}/edit`)}
            >
              <Edit size={18} />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="supervisor-review-detail-content">
        <div className="supervisor-review-detail-title-section">
          <h1 className="supervisor-review-detail-title">Supervisor Review</h1>
          <div className="supervisor-review-detail-badges">
            <ReviewStatusBadge status={selected.status} size="lg" />
            <span className="supervisor-review-detail-employee">
              <User size={16} />
              {selected.employee_name}
            </span>
          </div>
        </div>

        {comparison && (
          <div className="supervisor-review-detail-comparison">
            <CompetencyComparison comparison={comparison} />
          </div>
        )}

        <SupervisorReviewView review={selected} />
      </div>
    </div>
  );
};

export default SupervisorReviewDetail;