// src/components/reviews/competencies/list/CompetencyCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Star, Users, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCompetencies } from '../../../../hooks/reviews';

const CompetencyCard = ({ competency }) => {
  const navigate = useNavigate();
  const { deleteCompetency, canManage } = useCompetencies();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${competency.name}"?`)) {
      await deleteCompetency(competency.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/reviews/competencies/${competency.id}/edit`);
  };

  const handleView = () => {
    navigate(`/reviews/competencies/${competency.id}`);
  };

  return (
    <div className="competency-card" onClick={handleView}>
      <div className="competency-card-header">
        <div className="competency-card-title-section">
          <h3 className="competency-card-title">{competency.name}</h3>
          <div className="competency-card-badges">
            <ReviewStatusBadge status={competency.is_active ? 'active' : 'inactive'} />
            {competency.is_required && (
              <span className="competency-card-required">Required</span>
            )}
          </div>
        </div>
        <div className="competency-card-actions">
          {canManage && (
            <>
              <button className="competency-card-action-btn" onClick={handleEdit} aria-label="Edit">
                <Edit size={16} />
              </button>
              <button className="competency-card-action-btn danger" onClick={handleDelete} aria-label="Delete">
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button className="competency-card-action-btn" onClick={handleView} aria-label="View">
            <Eye size={16} />
          </button>
        </div>
      </div>

      {competency.description && (
        <p className="competency-card-description">{competency.description}</p>
      )}

      <div className="competency-card-stats">
        <div className="competency-card-stat">
          <span className="competency-card-stat-label">Type</span>
          <span className="competency-card-stat-value">{competency.competency_type?.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div className="competency-card-stat">
          <span className="competency-card-stat-label">Default Weight</span>
          <span className="competency-card-stat-value">{competency.default_weight}%</span>
        </div>
        <div className="competency-card-stat">
          <span className="competency-card-stat-label">Category</span>
          <span className="competency-card-stat-value">{competency.category_name || 'Uncategorized'}</span>
        </div>
      </div>

      <div className="competency-card-footer">
        <span className="competency-card-updated">
          Updated {new Date(competency.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default CompetencyCard;