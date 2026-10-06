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
    overall_comment: 'Overall Performance Comment',
    performance_summary: 'Performance Summary',
    strengths: 'Key Strengths & Capabilities',
    strengths_observed: 'Strengths Observed',
    weaknesses: 'Areas for Improvement & Development',
    areas_for_improvement: 'Areas for Improvement',
    development_areas: 'Development Areas',
    career: 'Career Aspirations & Growth',
    career_aspirations: 'Career Aspirations',
    challenges: 'Challenges Faced & Obstacles',
    challenges_faced: 'Challenges Faced',
    achievements: 'Key Achievements & Deliverables',
    achievements_recognized: 'Achievements Recognized',
    career_progression_notes: 'Career Progression Notes',
    training: 'Training & Development (Completed / Requested)',
    training_completed: 'Training Completed',
    training_requested: 'Training Requested',
    training_recommendations: 'Training Recommendations',
    goals: 'Goals & Objectives (Achieved / Next Period)',
    goals_achieved: 'Goals Achieved',
    goals_for_next_period: 'Goals for Next Period',
    feedback: 'Additional 360 / Stakeholder Feedback',
    recommendation: 'Recommendation',
    promotion_readiness: 'Promotion Readiness',
    bonus_recommendation: 'Bonus Recommendation',
  };

  const sectionQuestions = {
    overall_comment: 'Provide an overall self-evaluation summary of your performance during this appraisal cycle.',
    performance_summary: 'Summarize your core contributions, milestones, and results.',
    strengths: 'What are your key strengths, specialized skills, and standout contributions?',
    strengths_observed: 'What key technical and behavioral strengths were demonstrated?',
    weaknesses: 'What areas would you like to improve, and what development support is needed?',
    areas_for_improvement: 'What areas have been identified for future growth and skill improvement?',
    development_areas: 'What technical or leadership competencies require targeted upskilling?',
    career: 'What are your short and long-term career aspirations within the organization?',
    career_aspirations: 'Where do you see your career progression in the next 1-3 years?',
    challenges: 'What major challenges or obstacles did you encounter, and how did you resolve them?',
    challenges_faced: 'What operational or project blockers did you face during this cycle?',
    achievements: 'List your top achievements, successful projects, and delivered milestones.',
    achievements_recognized: 'Notable achievements, recognitions, or accolades received.',
    training: 'What training programs did you complete, and what learning opportunities do you request?',
    training_completed: 'List the professional courses, certifications, or workshops completed.',
    training_requested: 'What specific training or coaching would help you perform better?',
    goals: 'What key goals did you accomplish, and what are your commitments for the next review cycle?',
    goals_achieved: 'Detail the strategic and departmental targets you successfully reached.',
    goals_for_next_period: 'Set specific, measurable (SMART) goals for the upcoming review period.',
    feedback: 'Provide constructive feedback, observations, or collaboration insights.',
    promotion_readiness: 'Assess readiness for promotion, expanded scope, or higher leadership tier.',
    bonus_recommendation: 'Review performance justification for discretionary bonus or rewards.',
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
          const secKey = typeof section === 'object' && section !== null ? (section.name || section.value || '') : String(section);
          const isRequired = requiredSections.some(
            (r) => (typeof r === 'object' && r !== null ? r.name : String(r)) === secKey
          );
          const rawLabel = sectionLabels[secKey] || secKey;
          const label = typeof rawLabel === 'object' && rawLabel !== null ? (rawLabel.name || JSON.stringify(rawLabel)) : String(rawLabel);
          const helpText = typeof section === 'object' && section !== null ? section.help_text : null;
          const promptText = helpText || sectionQuestions[secKey] || null;

          return (
            <div key={index} className="template-sections-item">
              <div className="template-sections-item-left">
                <FileText size={14} className="template-sections-item-icon" />
                <div>
                  <span className="template-sections-item-label">{label}</span>
                  {promptText && (
                    <small style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '3px', fontStyle: 'italic', lineHeight: '1.4' }}>
                      &ldquo;{promptText}&rdquo;
                    </small>
                  )}
                </div>
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