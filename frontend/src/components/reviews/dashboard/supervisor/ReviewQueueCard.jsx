// src/components/reviews/dashboard/supervisor/ReviewQueueCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, User, Calendar } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const ReviewQueueCard = ({ reviews = [] }) => {
  const navigate = useNavigate();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-queue-card">
        <h3 className="review-queue-card-title">
          <Clock size={18} />
          Review Queue
        </h3>
        <div className="review-queue-card-empty">
          <p>No pending reviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-queue-card">
      <h3 className="review-queue-card-title">
        <Clock size={18} />
        Review Queue ({reviews.length})
      </h3>
      <div className="review-queue-card-list">
        {reviews.slice(0, 5).map((review, index) => (
          <div
            key={index}
            className="review-queue-card-item"
            onClick={() => navigate(`/reviews/supervisor-reviews/${review.employee_id}`)}
          >
            <div className="review-queue-card-item-info">
              <span className="review-queue-card-item-name">{review.employee_name}</span>
              <span className="review-queue-card-item-status">
                <ReviewStatusBadge status={review.status} size="sm" />
              </span>
            </div>
            <div className="review-queue-card-item-meta">
              <span className="review-queue-card-item-deadline">
                <Calendar size={12} />
                Due: {new Date(review.deadline).toLocaleDateString()}
              </span>
              <button
                className="review-queue-card-item-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/reviews/supervisor-reviews/${review.employee_id}`);
                }}
              >
                <Eye size={14} />
                Review
              </button>
            </div>
          </div>
        ))}
        {reviews.length > 5 && (
          <div className="review-queue-card-more">
            +{reviews.length - 5} more pending
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewQueueCard;