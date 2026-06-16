// src/components/reviews/calibration/detail/CalibrationSessionParticipants.jsx
import React from 'react';
import { Users, User, Mail } from 'lucide-react';

const CalibrationSessionParticipants = ({ session }) => {
  const participants = session.participants || [];
  const departments = session.departments_included || [];

  return (
    <div className="calibration-session-participants">
      <h3 className="calibration-session-participants-title">
        <Users size={18} />
        Participants
      </h3>

      <div className="calibration-session-participants-stats">
        <span className="calibration-session-participants-stat">
          {participants.length} participants
        </span>
        {departments.length > 0 && (
          <span className="calibration-session-participants-stat">
            {departments.length} departments
          </span>
        )}
      </div>

      {participants.length === 0 ? (
        <div className="calibration-session-participants-empty">No participants added</div>
      ) : (
        <div className="calibration-session-participants-list">
          {participants.map((participant, index) => (
            <div key={participant.id || index} className="calibration-session-participants-item">
              <div className="calibration-session-participants-avatar">
                {participant.name?.charAt(0) || 'U'}
              </div>
              <div className="calibration-session-participants-info">
                <span className="calibration-session-participants-name">
                  {participant.name || participant.email}
                </span>
                {participant.email && (
                  <span className="calibration-session-participants-email">
                    <Mail size={12} />
                    {participant.email}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {departments.length > 0 && (
        <div className="calibration-session-participants-departments">
          <h4 className="calibration-session-participants-departments-title">Departments</h4>
          <div className="calibration-session-participants-departments-list">
            {departments.map((dept, index) => (
              <span key={dept.id || index} className="calibration-session-participants-department">
                {dept.name || dept}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalibrationSessionParticipants;