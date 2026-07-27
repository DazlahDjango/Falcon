// src/components/reviews/dashboard/staff/StaffFeedbackTasks.jsx
import React from 'react';
import { Edit3, Calendar } from 'lucide-react';

const StaffFeedbackTasks = ({ tasks = [] }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="staff-feedback-summary" style={{ marginTop: '24px' }}>
        <h3 className="staff-feedback-summary-title">
          <Edit3 size={18} />
          Feedback I Need to Write
        </h3>
        <div className="staff-feedback-summary-empty">
          <p>No pending feedback tasks assigned to you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-feedback-summary" style={{ marginTop: '24px' }}>
      <h3 className="staff-feedback-summary-title">
        <Edit3 size={18} />
        Feedback I Need to Write
      </h3>
      <div className="staff-feedback-summary-list" style={{ gap: '8px' }}>
        {tasks.map((task) => (
          <div key={task.id} className="staff-feedback-summary-item" style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="staff-feedback-summary-item-reviewer" style={{ fontSize: '14px' }}>
                {task.subject_name}
              </span>
              <span className="staff-feedback-summary-item-type" style={{ fontSize: '12px' }}>
                Relationship: {task.reviewer_type} | Cycle: {task.cycle_name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                <Calendar size={14} />
                Due: {task.due_date}
              </span>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => window.location.href = `/reviews/feedback/respond/${task.id}`}
                style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
              >
                Write Feedback
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffFeedbackTasks;
