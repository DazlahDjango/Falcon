// src/components/reviews/self-assessments/detail/SelfAssessmentDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Printer } from 'lucide-react';
import { useSelfAssessment } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import SelfAssessmentView from './SelfAssessmentView';

const SelfAssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, canManage } = useSelfAssessment();

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <ReviewLoading size="lg" text="Loading self assessment..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="self-assessment-detail">
      <div className="self-assessment-detail-header">
        <button className="self-assessment-detail-back" onClick={() => navigate('/reviews/self-assessments')}>
          <ArrowLeft size={20} />
          Back to Assessments
        </button>
        <div className="self-assessment-detail-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          {canManage && selected.status === 'draft' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/reviews/self-assessments/${id}/edit`)}
            >
              <Edit size={18} />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="self-assessment-detail-content">
        <div className="self-assessment-detail-title-section">
          <h1 className="self-assessment-detail-title">Self Assessment</h1>
          <ReviewStatusBadge status={selected.status} size="lg" />
        </div>

        <SelfAssessmentView assessment={selected} />
      </div>
    </div>
  );
};

export default SelfAssessmentDetail;