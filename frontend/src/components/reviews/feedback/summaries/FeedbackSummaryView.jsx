// src/components/reviews/feedback/summaries/FeedbackSummaryView.jsx
import React from 'react';
import { Star, Users, User, Briefcase, Building } from 'lucide-react';

const FeedbackSummaryView = ({ summary }) => {
  if (!summary) return null;

  const ratingTypes = [
    { key: 'avg_manager_rating', label: 'Manager', icon: <User size={14} /> },
    { key: 'avg_peer_rating', label: 'Peer', icon: <Users size={14} /> },
    { key: 'avg_subordinate_rating', label: 'Subordinate', icon: <Briefcase size={14} /> },
    { key: 'avg_cross_dept_rating', label: 'Cross-Department', icon: <Building size={14} /> },
  ];

  const getRatingValue = (key) => {
    const value = summary[key];
    return value !== null && value !== undefined ? value.toFixed(1) : '—';
  };

  const renderStars = (rating) => {
    const numRating = typeof rating === 'number' ? rating : 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < Math.round(numRating) ? '#f59e0b' : 'none'}
        color={i < Math.round(numRating) ? '#f59e0b' : '#d1d5db'}
      />
    ));
  };

  return (
    <div className="feedback-summary-view">
      <div className="feedback-summary-view-section">
        <h3 className="feedback-summary-view-title">Rating Breakdown</h3>
        <div className="feedback-summary-view-ratings">
          {ratingTypes.map((type) => {
            const value = summary[type.key];
            return (
              <div key={type.key} className="feedback-summary-view-rating-item">
                <div className="feedback-summary-view-rating-header">
                  <span className="feedback-summary-view-rating-icon">{type.icon}</span>
                  <span className="feedback-summary-view-rating-label">{type.label}</span>
                  <span className="feedback-summary-view-rating-value">{getRatingValue(type.key)}</span>
                </div>
                <div className="feedback-summary-view-rating-stars">
                  {renderStars(value)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {summary.common_strengths && summary.common_strengths.length > 0 && (
        <div className="feedback-summary-view-section">
          <h3 className="feedback-summary-view-title">Common Strengths</h3>
          <ul className="feedback-summary-view-list">
            {summary.common_strengths.map((strength, index) => (
              <li key={index} className="feedback-summary-view-list-item">
                <span className="feedback-summary-view-list-bullet">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.common_improvements && summary.common_improvements.length > 0 && (
        <div className="feedback-summary-view-section">
          <h3 className="feedback-summary-view-title">Common Areas for Improvement</h3>
          <ul className="feedback-summary-view-list">
            {summary.common_improvements.map((improvement, index) => (
              <li key={index} className="feedback-summary-view-list-item">
                <span className="feedback-summary-view-list-bullet">•</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.anonymized_responses && summary.anonymized_responses.length > 0 && (
        <div className="feedback-summary-view-section">
          <h3 className="feedback-summary-view-title">Individual Responses</h3>
          <div className="feedback-summary-view-responses">
            {summary.anonymized_responses.map((response, index) => (
              <div key={index} className="feedback-summary-view-response">
                <div className="feedback-summary-view-response-header">
                  <span className="feedback-summary-view-response-type">
                    {response.reviewer_type}
                  </span>
                  {response.overall_rating && (
                    <span className="feedback-summary-view-response-rating">
                      {renderStars(response.overall_rating)}
                    </span>
                  )}
                </div>
                {response.strengths && (
                  <p className="feedback-summary-view-response-text">
                    <strong>Strengths:</strong> {response.strengths}
                  </p>
                )}
                {response.areas_for_improvement && (
                  <p className="feedback-summary-view-response-text">
                    <strong>Improvements:</strong> {response.areas_for_improvement}
                  </p>
                )}
                {response.suggestions && (
                  <p className="feedback-summary-view-response-text">
                    <strong>Suggestions:</strong> {response.suggestions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSummaryView;