// src/components/reviews/feedback/responses/FeedbackResponseForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Info, 
  BookOpen,
  HelpCircle,
  Sparkles,
  Save
} from 'lucide-react';
import { useFeedback, useRatingScales } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';

// Standard 360 Degree Feedback Frequency Scale (1 to 4)
export const FREQUENCY_SCALE_LEVELS = [
  { 
    value: 1, 
    label: 'Rarely', 
    shortDesc: 'Infrequently or only under prompting; improvement needed.',
    fullDesc: 'The behavior or skill is demonstrated infrequently or only under prompting. There is limited evidence of consistent application. Improvement is needed.',
    color: '#ef4444', 
    bg: '#fef2f2', 
    border: '#fca5a5' 
  },
  { 
    value: 2, 
    label: 'Sometimes', 
    shortDesc: 'Demonstrated occasionally, but not consistently.',
    fullDesc: 'The behavior or skill is demonstrated occasionally, but not consistently. May vary depending on context or support.',
    color: '#f97316', 
    bg: '#fff7ed', 
    border: '#fdba74' 
  },
  { 
    value: 3, 
    label: 'Often', 
    shortDesc: 'Demonstrated regularly and reliably; meets expectations.',
    fullDesc: 'The behavior or skill is demonstrated regularly and reliably. Meets expectations in most situations.',
    color: '#2563eb', 
    bg: '#eff6ff', 
    border: '#93c5fd' 
  },
  { 
    value: 4, 
    label: 'Always', 
    shortDesc: 'Consistently demonstrated at high level; role model.',
    fullDesc: 'The behavior or skill is consistently demonstrated at a high level. Exceeds expectations and serves as a model for others.',
    color: '#10b981', 
    bg: '#ecfdf5', 
    border: '#6ee7b7' 
  },
];

// Standard 360 Degree Behavioral Questionnaire (4 Categories, 17 Questions)
export const DEFAULT_360_CATEGORIES = [
  {
    id: 'collaboration_teamwork',
    name: 'Collaboration & Teamwork',
    description: 'Evaluates team contribution, openness to feedback, and constructive conflict resolution.',
    questions: [
      { id: 'collab_1', text: 'Does the colleague contribute to team success?' },
      { id: 'collab_2', text: 'Is the colleague open to feedback and willing to help others succeed?' },
      { id: 'collab_3', text: 'Does this colleague handle conflict or differing opinions within the team objectively?' },
    ],
  },
  {
    id: 'communication_interpersonal',
    name: 'Communication and Interpersonal Skills',
    description: 'Evaluates clear communication, active listening, knowledge sharing, and peer support.',
    questions: [
      { id: 'comm_1', text: 'Does the colleague communicate clearly and respectfully with team members?' },
      { id: 'comm_2', text: 'Does the colleague share information freely?' },
      { id: 'comm_3', text: 'Does the colleague listen actively and respond thoughtfully?' },
      { id: 'comm_4', text: 'How approachable and supportive are they when others seek help?' },
      { id: 'comm_5', text: 'Does the colleague help resolve issues constructively?' },
      { id: 'comm_6', text: 'Does the colleague go out of their way to support other team member?' },
    ],
  },
  {
    id: 'reliability_accountability',
    name: 'Reliability and Accountability',
    description: 'Evaluates commitment follow-through, dependability under pressure, and accountability.',
    questions: [
      { id: 'rel_1', text: 'Does this colleague follow through on commitments and meet deadlines?' },
      { id: 'rel_2', text: 'How dependable are they when the team faces pressure or tight timelines?' },
      { id: 'rel_3', text: 'Does the colleague take responsibility for mistakes and learn from them?' },
      { id: 'rel_4', text: 'Is the colleague open to feedback and new ways of working?' },
    ],
  },
  {
    id: 'professionalism_work_ethic',
    name: 'Professionalism and Work Ethic',
    description: 'Evaluates integrity, positive attitude in challenges, organizational values, and uplifting others.',
    questions: [
      { id: 'prof_1', text: 'Does the colleague demonstrate integrity and respect in their interactions?' },
      { id: 'prof_2', text: 'Does the colleague maintain a positive attitude, even in challenging situations?' },
      { id: 'prof_3', text: 'Does the colleague consistently uphold the organization’s values?' },
      { id: 'prof_4', text: 'Does the colleague encourage or uplift others to do better?' },
    ],
  },
];

const FeedbackResponseForm = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { submitResponse, fetchRequest, selectedRequest, requestLoading, requestError, myRequests = [] } = useFeedback();

  // Multi-Section Wizard state: Section 1 = Intro/Scale Guide, Section 2..N = Colleague evaluation
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState({
    ratings: {},
    additional_comments: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchRequest(requestId);
    }
  }, [requestId, fetchRequest]);

  // Load existing ratings if available
  useEffect(() => {
    if (selectedRequest?.response) {
      setFormData({
        ratings: selectedRequest.response.ratings || {},
        additional_comments: selectedRequest.response.additional_comments || '',
      });
    }
  }, [selectedRequest]);

  const categories = DEFAULT_360_CATEGORIES;

  // Total questions count
  const allQuestions = useMemo(() => {
    return categories.flatMap(cat => cat.questions);
  }, [categories]);

  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(formData.ratings).filter(
    k => formData.ratings[k] !== undefined && formData.ratings[k] !== null
  ).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleRatingSelect = (questionId, score) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [questionId]: score,
      },
    }));
  };

  const handleCommentsChange = (text) => {
    setFormData(prev => ({ ...prev, additional_comments: text }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit now?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      await submitResponse(requestId, {
        ratings: formData.ratings,
        additional_comments: formData.additional_comments,
        overall_rating: (
          Object.values(formData.ratings).reduce((a, b) => a + Number(b), 0) / (answeredCount || 1)
        ).toFixed(1),
        is_anonymous: true,
      });
      alert('🎉 Thank you! Your 360° Peer Feedback has been submitted successfully.');
      navigate('/reviews/feedback/requests');
    } catch (error) {
      console.error('Failed to submit 360 feedback:', error);
      alert('Failed to submit feedback: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestLoading) return <ReviewLoading size="lg" text="Loading 360 feedback form..." />;
  if (requestError) return <ReviewError error={requestError} onRetry={() => fetchRequest(requestId)} />;
  if (!selectedRequest) return null;

  const colleagueName = selectedRequest.subject_name || selectedRequest.subject?.name || 'Assigned Colleague';
  const colleagueRole = selectedRequest.subject_position || selectedRequest.subject?.title || selectedRequest.reviewer_type_display || 'Colleague';

  return (
    <div className="feedback-response-form" style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 16px', color: '#1e293b' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button 
          type="button" 
          onClick={() => navigate('/reviews/feedback/requests')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
        >
          <ArrowLeft size={16} />
          Back to Feedback Requests
        </button>

        {/* Section Tabs Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setCurrentSection(1)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: currentSection === 1 ? '#2563eb' : '#f1f5f9',
              color: currentSection === 1 ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Section 1: Guidelines
          </button>
          <button
            type="button"
            onClick={() => setCurrentSection(2)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: currentSection === 2 ? '#2563eb' : '#f1f5f9',
              color: currentSection === 2 ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Section 2: {colleagueName}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 360 DEGREE FEEDBACK GUIDELINES & FREQUENCY SCALE               */}
      {/* ========================================================================= */}
      {currentSection === 1 && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Section 1 of 2
              </span>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
                360 DEGREE FEEDBACK
              </h1>
            </div>
          </div>

          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 14px' }}>
            The purpose of this 360° feedback process is to provide constructive input that supports individual growth and strengthens overall team performance across the organization. Feedback will focus on <strong>collaboration, communication, reliability, professionalism, and leadership</strong>.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '10px', color: '#065f46', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px' }}>
            <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0 }} />
            <span>
              This process is <strong>anonymous</strong>, so please provide honest and thoughtful feedback based on your direct interactions with your colleagues. Your responses will be used solely for professional development and organizational improvement.
            </span>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px' }}>
            Frequency Scale Guide
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
            Use the frequency scale provided to evaluate behaviors:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {FREQUENCY_SCALE_LEVELS.map((lvl) => (
              <div 
                key={lvl.value} 
                style={{ 
                  background: lvl.bg, 
                  border: `1px solid ${lvl.border}`, 
                  borderRadius: '12px', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: lvl.color, color: '#fff', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {lvl.value}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: lvl.color }}>
                    {lvl.label}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: '#334155' }}>
                  {lvl.fullDesc}
                </p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#64748b', margin: '0 0 24px' }}>
            Thank you for taking the time to provide meaningful feedback.
          </p>

          <button
            type="button"
            onClick={() => setCurrentSection(2)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            Start Feedback for {colleagueName}
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: COLLEAGUE EVALUATION FORM                                      */}
      {/* ========================================================================= */}
      {currentSection === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Colleague Header Banner */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Section 2 of 2: Colleague Evaluation
                </span>
                <h2 style={{ margin: '4px 0 2px', fontSize: '22px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                  {colleagueName}
                </h2>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {colleagueRole}
                </span>
              </div>

              {/* Progress pill */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '10px', textAlign: 'right' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: progressPercent === 100 ? '#10b981' : '#2563eb' }}>
                  {answeredCount} of {totalQuestions} Answered ({progressPercent}%)
                </span>
                <div style={{ width: '130px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? '#10b981' : '#2563eb', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Categories */}
          {categories.map((cat, catIdx) => (
            <div key={cat.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              
              {/* Category Header */}
              <div style={{ background: '#f1f5f9', padding: '14px 20px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                    {cat.name} <span style={{ color: '#ef4444' }}>*</span>
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    1. Rarely &nbsp; 2. Sometimes &nbsp; 3. Often &nbsp; 4. Always
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', background: '#e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                  {cat.questions.length} Questions
                </span>
              </div>

              {/* Matrix Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '4fr 3fr', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 20px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <div>Question / Behavior</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center' }}>
                  <span>1 (Rarely)</span>
                  <span>2 (Sometimes)</span>
                  <span>3 (Often)</span>
                  <span>4 (Always)</span>
                </div>
              </div>

              {/* Category Questions */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {cat.questions.map((q, qIdx) => {
                  const currentScore = formData.ratings[q.id];

                  return (
                    <div 
                      key={q.id} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '4fr 3fr', 
                        gap: '12px', 
                        padding: '14px 20px', 
                        borderBottom: qIdx === cat.questions.length - 1 ? 'none' : '1px solid #f1f5f9',
                        background: qIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>
                        {q.text}
                      </span>

                      {/* 1-4 Frequency Selection Pills */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
                        {FREQUENCY_SCALE_LEVELS.map((lvl) => {
                          const isSelected = Number(currentScore) === Number(lvl.value);
                          return (
                            <button
                              key={lvl.value}
                              type="button"
                              onClick={() => handleRatingSelect(q.id, lvl.value)}
                              style={{
                                padding: '8px 4px',
                                borderRadius: '8px',
                                border: isSelected ? `2px solid ${lvl.color}` : '1px solid #cbd5e1',
                                background: isSelected ? lvl.bg : '#ffffff',
                                color: isSelected ? lvl.color : '#334155',
                                fontWeight: isSelected ? 800 : 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                              }}
                              title={`${lvl.value} - ${lvl.label}: ${lvl.shortDesc}`}
                            >
                              <span style={{ 
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '50%', 
                                background: isSelected ? lvl.color : '#f1f5f9', 
                                color: isSelected ? '#ffffff' : '#64748b',
                                fontSize: '11px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 800 
                              }}>
                                {lvl.value}
                              </span>
                              <span style={{ fontSize: '10px', display: isSelected ? 'block' : 'none' }}>
                                {lvl.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Open-Ended Additional Feedback */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
              Additional Feedback <span style={{ color: '#ef4444' }}>*</span>
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Please provide additional comments to support the ratings you’ve given above, including examples or observations. Highlight both strengths and development opportunities.
            </p>
            <textarea
              rows={4}
              value={formData.additional_comments}
              onChange={(e) => handleCommentsChange(e.target.value)}
              placeholder="Enter qualitative comments, observations, strengths, or growth areas..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                lineHeight: 1.5,
                color: '#1e293b',
                background: '#fafafa',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setCurrentSection(1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} />
              Back to Guidelines
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(22,163,74,0.25)',
              }}
            >
              <Send size={16} />
              {isSubmitting ? 'Submitting Feedback...' : 'Submit 360° Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackResponseForm;