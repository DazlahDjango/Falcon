// src/components/reviews/calibration/sessions/CalibrationSessionCard.jsx
import React from 'react';
import { Calendar, Users, User, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCalibration } from '../../../../hooks/reviews';

const CalibrationSessionCard = ({ session, onView }) => {
  const { deleteSession, canManage } = useCalibration();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${session.name}"?`)) {
      await deleteSession(session.id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="calibration-session-card" onClick={() => onView(session.id)}>
      <div className="calibration-session-card-header">
        <div className="calibration-session-card-title-section">
          <h3 className="calibration-session-card-title">{session.name}</h3>
          <div className="calibration-session-card-badges">
            <ReviewStatusBadge status={session.status} />
            {session.session_type && (
              <span className="calibration-session-card-type">{session.session_type_display}</span>
            )}
          </div>
        </div>
        <div className="calibration-session-card-actions">
          {canManage && (
            <>
              <button
                className="calibration-session-card-action-btn"
                onClick={(e) => { e.stopPropagation(); onView(session.id); }}
                aria-label="View"
              >
                <Eye size={16} />
              </button>
              <button
                className="calibration-session-card-action-btn"
                onClick={(e) => { e.stopPropagation(); /* navigate to edit */ }}
                aria-label="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                className="calibration-session-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {session.description && (
        <p className="calibration-session-card-description">{session.description}</p>
      )}

      <div className="calibration-session-card-details">
        <div className="calibration-session-card-detail">
          <Calendar size={16} />
          <span>{formatDate(session.scheduled_date)}</span>
        </div>
        <div className="calibration-session-card-detail">
          <User size={16} />
          <span>Facilitator: {session.facilitator_name || 'Unassigned'}</span>
        </div>
        <div className="calibration-session-card-detail">
          <Users size={16} />
          <span>{session.participants_count || 0} participants</span>
        </div>
        {session.is_upcoming && (
          <div className="calibration-session-card-detail upcoming">
            <Clock size={16} />
            <span>Upcoming</span>
          </div>
        )}
      </div>

      {session.outcome && (
        <div className="calibration-session-card-outcome">
          <span className="calibration-session-card-outcome-label">Outcome</span>
          <span className="calibration-session-card-outcome-value">{session.outcome_display}</span>
        </div>
      )}

      <div className="calibration-session-card-footer">
        <span className="calibration-session-card-cycle">{session.review_cycle_name}</span>
      </div>
    </div>
  );
};

export default CalibrationSessionCard;