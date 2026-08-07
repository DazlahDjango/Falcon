// src/components/reviews/competencies/list/CompetencyCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Star, Users, BarChart3, CheckCircle, XCircle, Copy } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCompetencies } from '../../../../hooks/reviews';

const CompetencyCard = ({ competency }) => {
  const navigate = useNavigate();
  const { deleteCompetency, cloneCompetency, activate, deactivate, patch, canManage } = useCompetencies();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (competency.usage_count > 0) {
      alert('Cannot delete a competency that is currently in use.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${competency.name}"?`)) {
      await deleteCompetency(competency.id);
    }
  };

  const handleClone = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to clone "${competency.name}"?`)) {
      try {
        await cloneCompetency(competency.id);
      } catch (err) {
        console.error('Failed to clone competency:', err);
      }
    }
  };

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    try {
      if (competency.is_active) {
        if (competency.usage_count > 0) {
          alert('Cannot deactivate a competency that has active ratings.');
          return;
        }
        await deactivate(competency.id);
      } else {
        await activate(competency.id);
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleToggleRequired = async (e) => {
    e.stopPropagation();
    try {
      await patch(competency.id, { is_required: !competency.is_required });
    } catch (err) {
      console.error('Failed to toggle required status:', err);
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
          <div className="competency-card-badges flex items-center gap-2">
            {canManage ? (
              <>
                <label className="flex items-center gap-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={competency.is_active || false}
                    onChange={handleToggleActive}
                    className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                    title="Toggle active status"
                  />
                  <span className={`text-xs ${competency.is_active ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {competency.is_active ? 'Active' : 'Inactive'}
                  </span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={competency.is_required || false}
                    onChange={handleToggleRequired}
                    className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                    title="Toggle required status"
                  />
                  <span className={`text-xs ${competency.is_required ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                    Required
                  </span>
                </label>
              </>
            ) : (
              <>
                <ReviewStatusBadge status={competency.is_active ? 'active' : 'inactive'} />
                {competency.is_required && (
                  <span className="competency-card-required">Required</span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="competency-card-actions">
          {canManage && (
            <>
              <button
                className="competency-card-action-btn"
                onClick={handleClone}
                aria-label="Clone"
                title="Clone Competency"
              >
                <Copy size={16} />
              </button>
              <button className="competency-card-action-btn" onClick={handleEdit} aria-label="Edit" title="Edit Competency">
                <Edit size={16} />
              </button>
              <button
                className="competency-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
                disabled={competency.usage_count > 0}
                title={competency.usage_count > 0 ? 'Competency is in use and cannot be deleted' : 'Delete Competency'}
                style={{
                  opacity: competency.usage_count > 0 ? 0.4 : 1,
                  cursor: competency.usage_count > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button className="competency-card-action-btn" onClick={handleView} aria-label="View" title="View Details">
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