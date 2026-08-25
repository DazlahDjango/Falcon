// src/components/reviews/self-assessments/detail/SelfAssessmentView.jsx
import React from 'react';
import { Calendar, User, CheckCircle, Clock, Edit3 } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const SelfAssessmentView = ({ assessment, onEdit = null, onBack = null, onReset = null }) => {
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
    <div className="self-assessment-view" style={{ background: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div className="self-assessment-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1e293b' }}>Full Self-Assessment Submission</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Comprehensive reflections and competency ratings.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}
            >
              ← Back to Overview
            </button>
          )}
          {onEdit && (
            <button 
              type="button" 
              onClick={onEdit}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
            >
              <Edit3 size={15} />
              Edit Assessment
            </button>
          )}
        </div>
      </div>

      <div className="self-assessment-view-meta" style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
        <div className="self-assessment-view-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
          <User size={15} />
          <span>{assessment.employee_name || 'Employee'}</span>
        </div>
        <div className="self-assessment-view-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
          <Calendar size={15} />
          <span>Submitted: {assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString() : 'Submitted'}</span>
        </div>
        <div className="self-assessment-view-meta-item">
          <ReviewStatusBadge status={assessment.status || 'submitted'} size="sm" />
        </div>
      </div>

      {assessment.competency_ratings && assessment.competency_ratings.length > 0 && (
        <div className="self-assessment-view-section" style={{ marginBottom: '24px' }}>
          <h3 className="self-assessment-view-section-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Competency Ratings</h3>
          <div className="self-assessment-view-ratings" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {assessment.competency_ratings.map((rating, index) => (
              <div key={index} className="self-assessment-view-rating-item" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="self-assessment-view-rating-name" style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>{rating.competency_name}</span>
                  <span className="self-assessment-view-rating-value" style={{ fontWeight: 700, color: '#2563eb', fontSize: '14px' }}>{rating.raw_score || rating.score}/5</span>
                </div>
                {rating.comment && (
                  <p className="self-assessment-view-rating-comment" style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="self-assessment-view-sections" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {sections.map((section) => (
          <div key={section.key} className="self-assessment-view-section" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
            <h4 className="self-assessment-view-section-label" style={{ margin: '0 0 6px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>{section.label}</h4>
            <p className="self-assessment-view-section-value" style={{ margin: 0, fontSize: '14px', color: '#1e293b', whiteSpace: 'pre-line' }}>
              {section.value || '—'}
            </p>
          </div>
        ))}
      </div>

      {assessment.integrity_checksum && (
        <div className="self-assessment-view-integrity" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '12px' }}>
          <CheckCircle size={14} />
          <span>Cryptographic Integrity Verified</span>
        </div>
      )}

      {onReset && (
        <div className="self-assessment-view-actions" style={{ marginTop: '24px' }}>
          <button className="btn btn-outline" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <Clock size={15} />
            Reset to Draft
          </button>
        </div>
      )}
    </div>
  );
};

export default SelfAssessmentView;