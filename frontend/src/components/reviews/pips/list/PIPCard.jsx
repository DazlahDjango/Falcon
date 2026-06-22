// src/components/reviews/pips/list/PIPCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Calendar, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { usePIP } from '../../../../hooks/reviews';

const PIPCard = ({ pip }) => {
  const navigate = useNavigate();
  const { deletePIP, canManage } = usePIP();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${pip.title}"?`)) {
      await deletePIP(pip.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/reviews/pips/${pip.id}/edit`);
  };

  const handleView = () => {
    navigate(`/reviews/pips/${pip.id}`);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      minor: '#6b7280',
      moderate: '#f59e0b',
      severe: '#ef4444',
      critical: '#dc2626',
    };
    return colors[severity] || '#6b7280';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = pip.is_overdue;
  const isActive = pip.status === 'active' || pip.status === 'draft' || pip.status === 'submitted';

  return (
    <div className="pip-card" onClick={handleView}>
      <div className="pip-card-header">
        <div className="pip-card-title-section">
          <h3 className="pip-card-title">{pip.title}</h3>
          <div className="pip-card-badges">
            <ReviewStatusBadge status={pip.status} />
            <span
              className="pip-card-severity"
              style={{ backgroundColor: getSeverityColor(pip.severity) }}
            >
              {pip.severity}
            </span>
          </div>
        </div>
        <div className="pip-card-actions">
          {canManage && (
            <>
              <button
                className="pip-card-action-btn"
                onClick={handleEdit}
                aria-label="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                className="pip-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            className="pip-card-action-btn"
            onClick={handleView}
            aria-label="View"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {pip.description && (
        <p className="pip-card-description">{pip.description}</p>
      )}

      <div className="pip-card-stats">
        <div className="pip-card-stat">
          <Users size={16} />
          <div>
            <span className="pip-card-stat-value">{pip.employee_name}</span>
            <span className="pip-card-stat-label">Employee</span>
          </div>
        </div>
        <div className="pip-card-stat">
          <Calendar size={16} />
          <div>
            <span className="pip-card-stat-value">
              {formatDate(pip.start_date)} - {formatDate(pip.end_date)}
            </span>
            <span className="pip-card-stat-label">Duration</span>
          </div>
        </div>
      </div>

      <div className="pip-card-progress">
        <div className="pip-card-progress-header">
          <span className="pip-card-progress-label">Progress</span>
          <span className="pip-card-progress-value">{pip.completion_percentage || 0}%</span>
        </div>
        <div className="pip-card-progress-bar">
          <div
            className="pip-card-progress-fill"
            style={{ width: `${pip.completion_percentage || 0}%` }}
          />
        </div>
        {isOverdue && isActive && (
          <div className="pip-card-overdue">
            <AlertCircle size={14} />
            Overdue by {Math.abs(pip.days_remaining || 0)} days
          </div>
        )}
        {!isOverdue && isActive && (
          <div className="pip-card-days">
            <Clock size={14} />
            {pip.days_remaining || 0} days remaining
          </div>
        )}
        {pip.status === 'completed' && (
          <div className="pip-card-completed">
            <CheckCircle size={14} />
            Completed - {pip.outcome_display || 'Completed'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PIPCard;