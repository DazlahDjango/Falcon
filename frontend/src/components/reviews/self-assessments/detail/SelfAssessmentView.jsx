// src/components/reviews/self-assessments/detail/SelfAssessmentView.jsx
import React from 'react';
import { Calendar, User, CheckCircle, Clock } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const SelfAssessmentView = ({ assessment, onReset = null }) => {
  if (!assessment) {
    return (
      <div className="self-assessment-view-empty">
        <p>No self assessment found.</p>
      </div>
    );
  }

  const sections = [
    { label: 'Overall Comment', value: assessment.overall_comment, key: 'overall_comment' },
    { label: 'Strengths', value: assessment.strengths, key: 'strengths' },
    { label: 'Areas for Improvement', value: assessment.areas_for_improvement, key: 'areas_for_improvement' },
    { label: 'Career Aspirations', value: assessment.career_aspirations, key: 'career_aspirations' },
    { label: 'Challenges Faced', value: assessment.challenges_faced, key: 'challenges_faced' },
    { label: 'Key Achievements', value: assessment.achievements, key: 'achievements' },
    { label: 'Training Completed', value: assessment.training_completed, key: 'training_completed' },
    { label: 'Training Requested', value: assessment.training_requested, key: 'training_requested' },
    { label: 'Goals Achieved', value: assessment.goals_achieved, key: 'goals_achieved' },
    { label: 'Goals for Next Period', value: assessment.goals_for_next_period, key: 'goals_for_next_period' },
  ];

  return (
    <div className="self-assessment-view">
      <div className="self-assessment-view-meta">
        <div className="self-assessment-view-meta-item">
          <User size={16} />
          <span>{assessment.employee_name || 'Employee'}</span>
        </div>
        <div className="self-assessment-view-meta-item">
          <Calendar size={16} />
          <span>Submitted: {assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString() : 'Not submitted'}</span>
        </div>
        <div className="self-assessment-view-meta-item">
          <ReviewStatusBadge status={assessment.status} size="sm" />
        </div>
      </div>

      {assessment.competency_ratings && assessment.competency_ratings.length > 0 && (
        <div className="self-assessment-view-section">
          <h3 className="self-assessment-view-section-title">Competency Ratings</h3>
          <div className="self-assessment-view-ratings">
            {assessment.competency_ratings.map((rating, index) => (
              <div key={index} className="self-assessment-view-rating-item">
                <span className="self-assessment-view-rating-name">{rating.competency_name}</span>
                <div className="self-assessment-view-rating-score">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`self-assessment-view-star ${rating.raw_score >= star ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="self-assessment-view-rating-value">{rating.raw_score}/5</span>
                </div>
                {rating.comment && (
                  <p className="self-assessment-view-rating-comment">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="self-assessment-view-sections">
        {sections.map((section) => (
          <div key={section.key} className="self-assessment-view-section">
            <h4 className="self-assessment-view-section-label">{section.label}</h4>
            <p className="self-assessment-view-section-value">
              {section.value || '—'}
            </p>
          </div>
        ))}
      </div>

      {assessment.integrity_checksum && (
        <div className="self-assessment-view-integrity">
          <CheckCircle size={14} />
          <span>Verified</span>
        </div>
      )}

      {onReset && (
        <div className="self-assessment-view-actions">
          <button className="btn btn-outline" onClick={onReset}>
            <Clock size={16} />
            Reset to Draft
          </button>
        </div>
      )}
    </div>
  );
};

export default SelfAssessmentView;