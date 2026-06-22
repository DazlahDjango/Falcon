// src/components/reviews/calibration/detail/CalibrationSessionInfo.jsx
import React from 'react';
import { Calendar, Users, User, Clock, FileText, Building } from 'lucide-react';

const CalibrationSessionInfo = ({ session }) => {
  const infoItems = [
    {
      icon: <Calendar size={18} />,
      label: 'Scheduled Date',
      value: new Date(session.scheduled_date).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      icon: <User size={18} />,
      label: 'Facilitator',
      value: session.facilitator_name || 'Unassigned',
    },
    {
      icon: <Users size={18} />,
      label: 'Participants',
      value: session.participants_count || 0,
    },
    {
      icon: <Building size={18} />,
      label: 'Departments',
      value: session.departments_count || 0,
    },
    {
      icon: <Clock size={18} />,
      label: 'Status',
      value: session.status_display,
    },
    {
      icon: <FileText size={18} />,
      label: 'Outcome',
      value: session.outcome_display || 'Pending',
    },
  ];

  if (session.actual_start_time) {
    infoItems.push({
      icon: <Clock size={18} />,
      label: 'Started At',
      value: new Date(session.actual_start_time).toLocaleString(),
    });
  }

  if (session.actual_end_time) {
    infoItems.push({
      icon: <Clock size={18} />,
      label: 'Ended At',
      value: new Date(session.actual_end_time).toLocaleString(),
    });
  }

  return (
    <div className="calibration-session-info">
      <h3 className="calibration-session-info-title">Session Information</h3>
      <div className="calibration-session-info-grid">
        {infoItems.map((item, index) => (
          <div key={index} className="calibration-session-info-item">
            <div className="calibration-session-info-icon">{item.icon}</div>
            <div className="calibration-session-info-content">
              <span className="calibration-session-info-label">{item.label}</span>
              <span className="calibration-session-info-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {session.agenda && (
        <div className="calibration-session-info-section">
          <h4 className="calibration-session-info-section-title">Agenda</h4>
          <p className="calibration-session-info-section-content">{session.agenda}</p>
        </div>
      )}

      {session.notes && (
        <div className="calibration-session-info-section">
          <h4 className="calibration-session-info-section-title">Notes</h4>
          <p className="calibration-session-info-section-content">{session.notes}</p>
        </div>
      )}

      {session.decisions && (
        <div className="calibration-session-info-section">
          <h4 className="calibration-session-info-section-title">Decisions</h4>
          <p className="calibration-session-info-section-content">{session.decisions}</p>
        </div>
      )}
    </div>
  );
};

export default CalibrationSessionInfo;