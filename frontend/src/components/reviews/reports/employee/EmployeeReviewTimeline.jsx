// src/components/reviews/reports/employee/EmployeeReviewTimeline.jsx
import React from 'react';
import { Clock, CheckCircle, FileText, User, Star } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const EmployeeReviewTimeline = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="employee-review-timeline">
        <h3 className="employee-review-timeline-title">Review Timeline</h3>
        <div className="employee-review-timeline-empty">
          <p>No timeline events available</p>
        </div>
      </div>
    );
  }

  const getEventIcon = (event) => {
    if (event.event.includes('Submitted')) return <FileText size={16} />;
    if (event.event.includes('Approved')) return <CheckCircle size={16} />;
    if (event.event.includes('Rating')) return <Star size={16} />;
    return <Clock size={16} />;
  };

  const getEventColor = (event) => {
    if (event.event.includes('Submitted')) return '#3b82f6';
    if (event.event.includes('Approved')) return '#22c55e';
    if (event.event.includes('Rating')) return '#8b5cf6';
    return '#6b7280';
  };

  return (
    <div className="employee-review-timeline">
      <h3 className="employee-review-timeline-title">Review Timeline</h3>
      <div className="employee-review-timeline-list">
        {timeline.map((event, index) => (
          <div key={index} className="employee-review-timeline-item">
            <div className="employee-review-timeline-item-icon" style={{ color: getEventColor(event) }}>
              {getEventIcon(event)}
            </div>
            <div className="employee-review-timeline-item-content">
              <div className="employee-review-timeline-item-header">
                <span className="employee-review-timeline-item-event">{event.event}</span>
                <span className="employee-review-timeline-item-date">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="employee-review-timeline-item-status">
                <ReviewStatusBadge status={event.status} size="sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeReviewTimeline;