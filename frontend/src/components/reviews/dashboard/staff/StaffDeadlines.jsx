// src/components/reviews/dashboard/staff/StaffDeadlines.jsx
import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const StaffDeadlines = ({ deadlines = [] }) => {
  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="staff-deadlines">
        <h3 className="staff-deadlines-title">Upcoming Deadlines</h3>
        <div className="staff-deadlines-empty">
          <CheckCircle size={24} color="#22c55e" />
          <p>No upcoming deadlines!</p>
        </div>
      </div>
    );
  }

  const getDeadlineColor = (days) => {
    if (days <= 3) return '#ef4444';
    if (days <= 7) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="staff-deadlines">
      <h3 className="staff-deadlines-title">
        <Clock size={18} />
        Upcoming Deadlines
      </h3>
      <div className="staff-deadlines-list">
        {deadlines.map((deadline, index) => (
          <div key={index} className="staff-deadlines-item">
            <div className="staff-deadlines-item-info">
              <span className="staff-deadlines-item-type">
                {deadline.type === 'self_assessment' ? 'Self Assessment' :
                 deadline.type === 'supervisor_review' ? 'Supervisor Review' :
                 deadline.type}
              </span>
              <span className="staff-deadlines-item-date">
                <Calendar size={14} />
                {new Date(deadline.date).toLocaleDateString()}
              </span>
            </div>
            <div className="staff-deadlines-item-days">
              <span style={{ color: getDeadlineColor(deadline.days_left) }}>
                {deadline.days_left} days left
              </span>
              {deadline.days_left <= 3 && (
                <AlertCircle size={14} color="#ef4444" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDeadlines;