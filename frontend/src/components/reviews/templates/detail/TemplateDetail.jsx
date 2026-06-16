// src/components/reviews/templates/detail/TemplateDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Copy, RefreshCw, Star } from 'lucide-react';
import { useTemplates } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import TemplateInfo from './TemplateInfo';
import TemplateSections from './TemplateSections';

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, error, fetchOne, deleteTemplate, duplicateTemplate, setDefault, canManage } = useTemplates();

  useEffect(() => {
    if (id) {
      fetchOne(id);
    }
  }, [id, fetchOne]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selected?.name}"?`)) {
      await deleteTemplate(id);
      navigate('/reviews/templates');
    }
  };

  const handleDuplicate = async () => {
    const duplicated = await duplicateTemplate(id);
    if (duplicated) {
      navigate(`/reviews/templates/${duplicated.id}`);
    }
  };

  const handleSetDefault = async () => {
    await setDefault(id);
    fetchOne(id);
  };

  const handleRefresh = () => {
    if (id) {
      fetchOne(id);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading template..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(id)} />;
  if (!selected) return null;

  return (
    <div className="template-detail">
      <div className="template-detail-header">
        <button className="template-detail-back" onClick={() => navigate('/reviews/templates')}>
          <ArrowLeft size={20} />
          Back to Templates
        </button>
        <div className="template-detail-actions">
          <button className="template-detail-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-outline" onClick={handleDuplicate}>
            <Copy size={18} />
            Duplicate
          </button>
          {canManage && (
            <>
              {!selected.is_default && (
                <button className="btn btn-outline" onClick={handleSetDefault}>
                  <Star size={18} />
                  Set Default
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/reviews/templates/${id}/edit`)}
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

      <div className="template-detail-content">
        <div className="template-detail-top">
          <div className="template-detail-title-section">
            <h1 className="template-detail-title">{selected.name}</h1>
            <div className="template-detail-badges">
              <ReviewStatusBadge status={selected.is_active ? 'active' : 'inactive'} size="lg" />
              {selected.is_default && (
                <span className="template-detail-default">
                  <Star size={14} />
                  Default
                </span>
              )}
              <span className="template-detail-version">v{selected.version || 1}</span>
            </div>
          </div>
        </div>

        {selected.description && (
          <p className="template-detail-description">{selected.description}</p>
        )}

        <div className="template-detail-grid">
          <div className="template-detail-main">
            <TemplateInfo template={selected} />
          </div>
          <div className="template-detail-sidebar">
            <TemplateSections template={selected} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetail;