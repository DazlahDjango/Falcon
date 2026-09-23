import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Printer, Trash2 } from 'lucide-react';
import { useSelfAssessment, useReviewsPermissions } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import SelfAssessmentView from './SelfAssessmentView';

const SelfAssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useReviewsPermissions();
  const { selected, loading, error, clearErrors, fetchOne, remove, canManage } = useSelfAssessment();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete this self-assessment (${selected?.employee_name || 'draft'})?`)) {
      setIsDeleting(true);
      try {
        await remove(id);
        alert('Self-assessment deleted successfully.');
        navigate('/reviews/self-assessment');
      } catch (err) {
        alert('Failed to delete self-assessment: ' + (err.response?.data?.error || err.message || 'Permission denied'));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading && !selected) return <ReviewLoading size="lg" text="Loading self assessment..." />;
  if (error && !selected) return <ReviewError error={error} onRetry={() => { if (clearErrors) clearErrors(); fetchOne(id); }} />;
  if (!selected) return null;

  return (
    <div className="self-assessment-detail">
      <div className="self-assessment-detail-header">
        <button className="self-assessment-detail-back" onClick={() => navigate('/reviews/self-assessments')}>
          <ArrowLeft size={20} />
          Back to Assessments
        </button>
        <div className="self-assessment-detail-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          {selected.status === 'draft' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/reviews/self-assessments/${id}/edit`)}
            >
              <Edit size={18} />
              Edit
            </button>
          )}
          {(selected.status === 'draft' || isAdmin) && (
            <button
              type="button"
              className="btn"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}
              title="Delete this self assessment"
            >
              <Trash2 size={16} />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      <div className="self-assessment-detail-content">
        <div className="self-assessment-detail-title-section">
          <h1 className="self-assessment-detail-title">Self Assessment</h1>
          <ReviewStatusBadge status={selected.status} size="lg" />
        </div>

        <SelfAssessmentView 
          assessment={selected} 
          onEdit={selected.status === 'draft' ? () => navigate(`/reviews/self-assessments/${id}/edit`) : null}
          onBack={() => navigate('/reviews/self-assessment')}
          onDelete={(selected.status === 'draft' || isAdmin) ? handleDelete : null}
        />
      </div>
    </div>
  );
};

export default SelfAssessmentDetail;