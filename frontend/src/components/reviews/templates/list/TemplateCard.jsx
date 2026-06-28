// src/components/reviews/templates/list/TemplateCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Copy, FileText, Star, CheckCircle } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useTemplates } from '../../../../hooks/reviews';

const TemplateCard = ({ template }) => {
  const navigate = useNavigate();
  const { deleteTemplate, duplicateTemplate, canManage } = useTemplates();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      await deleteTemplate(template.id);
    }
  };

  const handleDuplicate = async (e) => {
    e.stopPropagation();
    await duplicateTemplate(template.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/reviews/templates/${template.id}/edit`);
  };

  const handleView = () => {
    navigate(`/reviews/templates/${template.id}`);
  };

  const sectionCount = template.included_sections?.length || 0;

  return (
    <div className="template-card" onClick={handleView}>
      <div className="template-card-header">
        <div className="template-card-title-section">
          <div className="template-card-icon">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="template-card-title">{template.name}</h3>
            <div className="template-card-badges">
              <span className="template-card-version">v{template.version || 1}</span>
              {template.is_default && (
                <span className="template-card-default">
                  <Star size={12} />
                  Default
                </span>
              )}
              <ReviewStatusBadge status={template.is_active ? 'active' : 'inactive'} size="sm" />
            </div>
          </div>
        </div>
        <div className="template-card-actions">
          <button
            className="template-card-action-btn"
            onClick={handleDuplicate}
            aria-label="Duplicate"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          {canManage && (
            <>
              <button
                className="template-card-action-btn"
                onClick={handleEdit}
                aria-label="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                className="template-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            className="template-card-action-btn"
            onClick={handleView}
            aria-label="View"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {template.description && (
        <p className="template-card-description">{template.description}</p>
      )}

      <div className="template-card-stats">
        <div className="template-card-stat">
          <span className="template-card-stat-label">Sections</span>
          <span className="template-card-stat-value">{sectionCount}</span>
        </div>
        <div className="template-card-stat">
          <span className="template-card-stat-label">Applies To</span>
          <span className="template-card-stat-value">
            {template.applies_to_self_assessment && 'Self, '}
            {template.applies_to_supervisor_review && 'Supervisor, '}
            {template.applies_to_360_feedback && '360'}
            {!template.applies_to_self_assessment && 
             !template.applies_to_supervisor_review && 
             !template.applies_to_360_feedback && '—'}
          </span>
        </div>
        <div className="template-card-stat">
          <span className="template-card-stat-label">Required Sections</span>
          <span className="template-card-stat-value">{template.required_sections?.length || 0}</span>
        </div>
      </div>

      {template.included_sections && template.included_sections.length > 0 && (
        <div className="template-card-sections">
          {template.included_sections.slice(0, 3).map((section, index) => (
            <span key={index} className="template-card-section">
              {section}
            </span>
          ))}
          {template.included_sections.length > 3 && (
            <span className="template-card-section-more">
              +{template.included_sections.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="template-card-footer">
        <span className="template-card-updated">
          Updated {new Date(template.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default TemplateCard;