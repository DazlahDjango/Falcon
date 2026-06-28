// src/components/reviews/feedback/responses/FeedbackResponseView.jsx
import React from 'react';
import { Star, User, Calendar, CheckCircle, Lock } from 'lucide-react';

const FeedbackResponseView = ({ response }) => {
  if (!response) {
    return (
      <div className="feedback-response-view-empty">
        <p>No response submitted yet.</p>
      </div>
    );
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        fill={i < rating ? '#f59e0b' : 'none'}
        color={i < rating ? '#f59e0b' : '#d1d5db'}
      />
    ));
  };

  return (
    <div className="feedback-response-view">
      <div className="feedback-response-view-header">
        <div className="feedback-response-view-meta">
          <span className="feedback-response-view-reviewer">
            <User size={16} />
            {response.reviewer_name}
          </span>
          <span className="feedback-response-view-date">
            <Calendar size={16} />
            {new Date(response.submitted_at).toLocaleDateString()}
          </span>
          {response.is_anonymous_response && (
            <span className="feedback-response-view-anonymous">
              <Lock size={14} />
              Anonymous
            </span>
          )}
        </div>
        {response.overall_rating && (
          <div className="feedback-response-view-rating">
            {renderStars(response.overall_rating)}
            <span className="feedback-response-view-rating-value">
              {response.overall_rating}/5
            </span>
          </div>
        )}
      </div>

      <div className="feedback-response-view-body">
        {response.strengths && (
          <div className="feedback-response-view-section">
            <h4 className="feedback-response-view-section-title">Strengths</h4>
            <p className="feedback-response-view-section-content">{response.strengths}</p>
          </div>
        )}

        {response.areas_for_improvement && (
          <div className="feedback-response-view-section">
            <h4 className="feedback-response-view-section-title">Areas for Improvement</h4>
            <p className="feedback-response-view-section-content">{response.areas_for_improvement}</p>
          </div>
        )}

        {response.specific_examples && (
          <div className="feedback-response-view-section">
            <h4 className="feedback-response-view-section-title">Specific Examples</h4>
            <p className="feedback-response-view-section-content">{response.specific_examples}</p>
          </div>
        )}

        {response.suggestions && (
          <div className="feedback-response-view-section">
            <h4 className="feedback-response-view-section-title">Suggestions</h4>
            <p className="feedback-response-view-section-content">{response.suggestions}</p>
          </div>
        )}

        {response.additional_comments && (
          <div className="feedback-response-view-section">
            <h4 className="feedback-response-view-section-title">Additional Comments</h4>
            <p className="feedback-response-view-section-content">{response.additional_comments}</p>
          </div>
        )}
      </div>

      {response.integrity_checksum && (
        <div className="feedback-response-view-footer">
          <CheckCircle size={14} color="#22c55e" />
          <span>Verified Response</span>
        </div>
      )}
    </div>
  );
};

export default FeedbackResponseView;