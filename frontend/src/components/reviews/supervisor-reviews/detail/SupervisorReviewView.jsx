// src/components/reviews/supervisor-reviews/detail/SupervisorReviewView.jsx
import React from 'react';
import { Calendar, User, CheckCircle, Award, TrendingUp, DollarSign } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const SupervisorReviewView = ({ review }) => {
  if (!review) return null;

  const sections = [
    { label: 'Performance Summary', value: review.performance_summary, key: 'performance_summary' },
    { label: 'Strengths Observed', value: review.strengths_observed, key: 'strengths_observed' },
    { label: 'Development Areas', value: review.development_areas, key: 'development_areas' },
    { label: 'Achievements Recognized', value: review.achievements_recognized, key: 'achievements_recognized' },
    { label: 'Career Progression Notes', value: review.career_progression_notes, key: 'career_progression_notes' },
    { label: 'Training Recommendations', value: review.training_recommendations, key: 'training_recommendations' },
    { label: 'Goals for Next Period', value: review.goals_for_next_period, key: 'goals_for_next_period' },
    { label: 'Overall Comment', value: review.overall_comment, key: 'overall_comment' },
  ];

  return (
    <div className="supervisor-review-view">
      <div className="supervisor-review-view-meta">
        <div className="supervisor-review-view-meta-item">
          <User size={16} />
          <span>Employee: {review.employee_name}</span>
        </div>
        <div className="supervisor-review-view-meta-item">
          <User size={16} />
          <span>Supervisor: {review.supervisor_name}</span>
        </div>
        <div className="supervisor-review-view-meta-item">
          <Calendar size={16} />
          <span>Submitted: {review.submitted_at ? new Date(review.submitted_at).toLocaleDateString() : 'Not submitted'}</span>
        </div>
        <div className="supervisor-review-view-meta-item">
          <ReviewStatusBadge status={review.status} size="sm" />
        </div>
      </div>

      {review.recommendation && (
        <div className="supervisor-review-view-recommendation">
          <h4 className="supervisor-review-view-recommendation-title">Recommendation</h4>
          <p className="supervisor-review-view-recommendation-value">
            {review.recommendation_display || review.recommendation}
          </p>
        </div>
      )}

      {review.competency_ratings && review.competency_ratings.length > 0 && (
        <div className="supervisor-review-view-section">
          <h3 className="supervisor-review-view-section-title">Competency Ratings</h3>
          <div className="supervisor-review-view-ratings">
            {review.competency_ratings.map((rating, index) => (
              <div key={index} className="supervisor-review-view-rating-item">
                <span className="supervisor-review-view-rating-name">{rating.competency_name}</span>
                <div className="supervisor-review-view-rating-score">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`supervisor-review-view-star ${rating.raw_score >= star ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="supervisor-review-view-rating-value">{rating.raw_score}/5</span>
                </div>
                {rating.comment && (
                  <p className="supervisor-review-view-rating-comment">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="supervisor-review-view-sections">
        {sections.map((section) => (
          <div key={section.key} className="supervisor-review-view-section">
            <h4 className="supervisor-review-view-section-label">{section.label}</h4>
            <p className="supervisor-review-view-section-value">
              {section.value || '—'}
            </p>
          </div>
        ))}
      </div>

      {review.bonus_recommendation && (
        <div className="supervisor-review-view-badge bonus">
          <Award size={16} />
          Bonus Recommended: {review.bonus_percentage || 'TBD'}%
        </div>
      )}

      {review.promotion_readiness && (
        <div className="supervisor-review-view-badge promotion">
          <TrendingUp size={16} />
          Promotion Readiness: {review.promotion_readiness?.replace('_', ' ').toUpperCase()}
          {review.promotion_target_role && ` → ${review.promotion_target_role}`}
        </div>
      )}

      {review.override_kpi_score && (
        <div className="supervisor-review-view-badge override">
          <DollarSign size={16} />
          KPI Override: {review.override_kpi_score}%
          {review.override_reason && ` (${review.override_reason})`}
        </div>
      )}

      {review.integrity_checksum && (
        <div className="supervisor-review-view-integrity">
          <CheckCircle size={14} />
          <span>Verified</span>
        </div>
      )}
    </div>
  );
};

export default SupervisorReviewView;