// src/components/reviews/supervisor-reviews/queue/ReviewQueueItem.jsx
import React from 'react';
import { Calendar, User, Clock, AlertCircle, ChevronRight, CheckCircle, FileText } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const ReviewQueueItem = ({ review, onView }) => {
  const isOverdue = review.deadline && new Date(review.deadline) < new Date();
  const daysRemaining = review.deadline
    ? Math.ceil((new Date(review.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="review-queue-item" onClick={() => onView(review.id)}>
      <div className="review-queue-item-left">
        <div className="review-queue-item-avatar">
          {review.employee_name?.charAt(0) || 'E'}
        </div>
        <div className="review-queue-item-info">
          <div className="review-queue-item-name">{review.employee_name}</div>
          <div className="review-queue-item-email">{review.employee_email}</div>
          <div className="review-queue-item-meta">
            <span className="review-queue-item-cycle">
              <FileText size={12} />
              {review.review_cycle_name}
            </span>
            <span className="review-queue-item-status">
              <ReviewStatusBadge status={review.status} size="sm" />
            </span>
            {isOverdue && (
              <span className="review-queue-item-overdue">
                <AlertCircle size={12} />
                Overdue
              </span>
            )}
            {daysRemaining !== null && daysRemaining > 0 && (
              <span className="review-queue-item-days">
                <Clock size={12} />
                {daysRemaining} days left
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="review-queue-item-right">
        {review.self_assessment_submitted && (
          <span className="review-queue-item-badge submitted">
            <CheckCircle size={12} />
            Self Assessment Done
          </span>
        )}
        <button className="review-queue-item-view" onClick={(e) => { e.stopPropagation(); onView(review.id); }}>
          Review
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReviewQueueItem;