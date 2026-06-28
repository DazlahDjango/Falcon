// src/components/reviews/cycles/list/CycleCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCycles } from '../../../../hooks/reviews';

const CycleCard = ({ cycle }) => {
  const navigate = useNavigate();
  const { deleteCycle, canManage } = useCycles();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${cycle.name}"?`)) {
      await deleteCycle(cycle.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/reviews/cycles/${cycle.id}/edit`);
  };

  const handleView = () => {
    navigate(`/reviews/cycles/${cycle.id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6b7280',
      active: '#22c55e',
      submitted: '#3b82f6',
      completed: '#8b5cf6',
      archived: '#9ca3af',
      approved: '#22c55e',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="cycle-card" onClick={handleView}>
      <div className="cycle-card-header">
        <div className="cycle-card-title-section">
          <h3 className="cycle-card-title">{cycle.name}</h3>
          <ReviewStatusBadge status={cycle.status} />
        </div>
        <div className="cycle-card-actions">
          {canManage && (
            <>
              <button
                className="cycle-card-action-btn"
                onClick={handleEdit}
                aria-label="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                className="cycle-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            className="cycle-card-action-btn"
            onClick={handleView}
            aria-label="View"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {cycle.description && (
        <p className="cycle-card-description">{cycle.description}</p>
      )}

      <div className="cycle-card-dates">
        <div className="cycle-card-date">
          <Calendar size={14} />
          <span>Start: {formatDate(cycle.start_date)}</span>
        </div>
        <div className="cycle-card-date">
          <Calendar size={14} />
          <span>End: {formatDate(cycle.end_date)}</span>
        </div>
      </div>

      <div className="cycle-card-stats">
        <div className="cycle-card-stat">
          <Users size={16} />
          <span className="cycle-card-stat-value">{cycle.participants_count || 0}</span>
          <span className="cycle-card-stat-label">Participants</span>
        </div>
        <div className="cycle-card-stat">
          <Clock size={16} />
          <span className="cycle-card-stat-value">{cycle.days_remaining || 0}</span>
          <span className="cycle-card-stat-label">Days Left</span>
        </div>
        <div className="cycle-card-stat">
          <div className="cycle-card-progress-circle">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeDasharray={`${cycle.progress || 0} 100`}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span className="cycle-card-progress-text">{cycle.progress || 0}%</span>
          </div>
        </div>
      </div>

      <div className="cycle-card-footer">
        <span className="cycle-card-type">
          {cycle.cycle_type?.replace('_', ' ').toUpperCase() || 'Custom'}
        </span>
        <span className="cycle-card-updated">
          Updated {new Date(cycle.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default CycleCard;