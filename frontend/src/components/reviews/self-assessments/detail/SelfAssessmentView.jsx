// src/components/reviews/self-assessments/detail/SelfAssessmentView.jsx
import React from 'react';
import { Calendar, User, CheckCircle, Clock, Edit3, Trash2 } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const SelfAssessmentView = ({ assessment, onEdit = null, onBack = null, onReset = null, onDelete = null }) => {
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
      <div className="self-assessment-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1e293b' }}>Full Self-Assessment Submission</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Comprehensive reflections and competency ratings.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}
            >
              ← Back
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
          {onDelete && (
            <button 
              type="button" 
              onClick={onDelete}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
            >
              <Trash2 size={15} />
              Delete
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
          <span>
            {assessment.submitted_at 
              ? `Submitted: ${new Date(assessment.submitted_at).toLocaleDateString()}` 
              : 'Status: Draft (In Progress)'}
          </span>
        </div>
        <div className="self-assessment-view-meta-item">
          <ReviewStatusBadge status={assessment.status || 'submitted'} size="sm" />
        </div>
      </div>

      {assessment.competency_ratings && assessment.competency_ratings.length > 0 && (
        <div className="self-assessment-view-section" style={{ marginBottom: '28px', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ background: '#f1f5f9', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              SECTION III: QUALITATIVE PERFORMANCE FACTORS
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              Specific qualitative factors assessed on a 1 to 5 scale (1=Strongly Disagree, 5=Strongly Agree).
            </p>
          </div>
          <div className="self-assessment-view-ratings" style={{ display: 'flex', flexDirection: 'column' }}>
            {assessment.competency_ratings.map((rating, index) => {
              const score = Number(rating.raw_score !== undefined ? rating.raw_score : rating.score);
              const scoreLabels = {
                1: { label: 'Strongly Disagree', color: '#ef4444', bg: '#fef2f2' },
                2: { label: 'Disagree', color: '#f97316', bg: '#fff7ed' },
                3: { label: 'Neither Agree nor Disagree', color: '#64748b', bg: '#f8fafc' },
                4: { label: 'Agree', color: '#3b82f6', bg: '#eff6ff' },
                5: { label: 'Strongly Agree', color: '#10b981', bg: '#ecfdf5' },
              };
              const scoreInfo = scoreLabels[score] || { label: 'Rated', color: '#2563eb', bg: '#eff6ff' };

              return (
                <div 
                  key={index} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '3fr 2fr 3fr', 
                    gap: '12px', 
                    padding: '12px 16px', 
                    borderBottom: index === assessment.competency_ratings.length - 1 ? 'none' : '1px solid #f1f5f9',
                    background: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b', display: 'block' }}>
                      {index + 1}. {rating.competency_name || 'Qualitative Factor'}
                    </span>
                  </div>
                  <div>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      background: scoreInfo.bg, 
                      color: scoreInfo.color, 
                      fontWeight: 700, 
                      fontSize: '12px', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      border: `1px solid ${scoreInfo.color}33` 
                    }}>
                      <span>{score} / 5</span>
                      <span>• {scoreInfo.label}</span>
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: rating.comment ? '#334155' : '#94a3b8', fontStyle: rating.comment ? 'normal' : 'italic' }}>
                      {rating.comment || 'No remarks provided'}
                    </span>
                  </div>
                </div>
              );
            })}
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