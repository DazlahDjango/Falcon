// src/components/reviews/pips/detail/PIPDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw, Printer } from 'lucide-react';
import { usePIP } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import PIPInfo from './PIPInfo';
import PIPProgress from './PIPProgress';
import PIPActions from './PIPActions';
import PIPReviews from './PIPReviews';
import PIPActionsList from './PIPActionsList';

const PIPDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, deletePIP, getProgress, getFullReport, canManage } = usePIP();

  useEffect(() => {
    if (id) {
      fetchOne(id);
      getProgress(id);
      getFullReport(id);
    }
  }, [id, fetchOne, getProgress, getFullReport]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selected?.title}"?`)) {
      await deletePIP(id);
      navigate('/reviews/pips');
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchOne(id);
      getProgress(id);
      getFullReport(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <ReviewLoading size="lg" text="Loading PIP..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="pip-detail">
      <div className="pip-detail-header">
        <button className="pip-detail-back" onClick={() => navigate('/reviews/pips')}>
          <ArrowLeft size={20} />
          Back to PIPs
        </button>
        <div className="pip-detail-actions">
          <button className="pip-detail-refresh" onClick={handleRefresh}>
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
                onClick={() => navigate(`/reviews/pips/${id}/edit`)}
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

      <div className="pip-detail-content">
        <div className="pip-detail-title-section">
          <h1 className="pip-detail-title">{selected.title}</h1>
          <div className="pip-detail-badges">
            <ReviewStatusBadge status={selected.status} size="lg" />
            <span className="pip-detail-severity" style={{ 
              backgroundColor: {
                minor: '#6b7280',
                moderate: '#f59e0b',
                severe: '#ef4444',
                critical: '#dc2626',
              }[selected.severity] 
            }}>
              {selected.severity}
            </span>
          </div>
        </div>

        {selected.description && (
          <p className="pip-detail-description">{selected.description}</p>
        )}

        <div className="pip-detail-grid">
          <div className="pip-detail-main">
            <PIPInfo pip={selected} />
            <PIPProgress pipId={id} />
            <PIPActionsList pipId={id} />
          </div>
          <div className="pip-detail-sidebar">
            <PIPActions pip={selected} onAction={handleRefresh} />
            <PIPReviews pipId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PIPDetail;