// src/components/reviews/templates/detail/TemplateSections.jsx
import React from 'react';
import { FileText, CheckCircle, AlertCircle, List } from 'lucide-react';

const TemplateSections = ({ template }) => {
  const allSections = [
    'overall_comment',
    'performance_summary',
    'strengths',
    'strengths_observed',
    'areas_for_improvement',
    'development_areas',
    'career_aspirations',
    'challenges_faced',
    'achievements',
    'achievements_recognized',
    'career_progression_notes',
    'training_completed',
    'training_requested',
    'training_recommendations',
    'goals_achieved',
    'goals_for_next_period',
    'recommendation',
    'promotion_readiness',
    'bonus_recommendation',
  ];

  const sectionLabels = {
    overall_comment: 'Overall Comment',
    performance_summary: 'Performance Summary',
    strengths: 'Strengths',
    strengths_observed: 'Strengths Observed',
    areas_for_improvement: 'Areas for Improvement',
    development_areas: 'Development Areas',
    career_aspirations: 'Career Aspirations',
    challenges_faced: 'Challenges Faced',
    achievements: 'Achievements',
    achievements_recognized: 'Achievements Recognized',
    career_progression_notes: 'Career Progression Notes',
    training_completed: 'Training Completed',
    training_requested: 'Training Requested',
    training_recommendations: 'Training Recommendations',
    goals_achieved: 'Goals Achieved',
    goals_for_next_period: 'Goals for Next Period',
    recommendation: 'Recommendation',
    promotion_readiness: 'Promotion Readiness',
    bonus_recommendation: 'Bonus Recommendation',
  };

  const includedSections = template.included_sections || [];
  const requiredSections = template.required_sections || [];

  return (
    <div className="template-sections">
      <h3 className="template-sections-title">
        <List size={18} />
        Sections
      </h3>

      <div className="template-sections-stats">
        <span className="template-sections-stat">
          Total: {includedSections.length}
        </span>
        <span className="template-sections-stat">
          Required: {requiredSections.length}
        </span>
        <span className="template-sections-stat">
          Optional: {includedSections.length - requiredSections.length}
        </span>
      </div>

      <div className="template-sections-list">
        {includedSections.map((section, index) => {
          const isRequired = requiredSections.includes(section);
          const label = sectionLabels[section] || section;

          return (
            <div key={index} className="template-sections-item">
              <div className="template-sections-item-left">
                <FileText size={14} className="template-sections-item-icon" />
                <span className="template-sections-item-label">{label}</span>
              </div>
              <div className="template-sections-item-right">
                {isRequired ? (
                  <span className="template-sections-item-required">
                    <CheckCircle size={14} color="#22c55e" />
                    Required
                  </span>
                ) : (
                  <span className="template-sections-item-optional">
                    <AlertCircle size={14} color="#6b7280" />
                    Optional
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {includedSections.length === 0 && (
        <div className="template-sections-empty">
          <p>No sections defined</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSections;