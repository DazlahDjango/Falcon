// src/components/reviews/self-assessments/form/SelfAssessmentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Send, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useSelfAssessment, useCycles } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import SelfAssessmentCompetencyRating from './SelfAssessmentCompetencyRating';
import SelfAssessmentComment from './SelfAssessmentComment';
import SelfAssessmentProgress from './SelfAssessmentProgress';

const SelfAssessmentForm = () => {
  const navigate = useNavigate();
  const { mySelfAssessment, loading, error, fetchMy, submit, saveDraft, resetToDraft } = useSelfAssessment();
  const { activeCycle } = useCycles();
  const [formData, setFormData] = useState({
    overall_comment: '',
    strengths: '',
    areas_for_improvement: '',
    career_aspirations: '',
    challenges_faced: '',
    achievements: '',
    training_completed: '',
    training_requested: '',
    goals_achieved: '',
    goals_for_next_period: '',
    competency_ratings: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMy();
  }, [fetchMy]);

  useEffect(() => {
    if (mySelfAssessment) {
      setFormData({
        overall_comment: mySelfAssessment.overall_comment || '',
        strengths: mySelfAssessment.strengths || '',
        areas_for_improvement: mySelfAssessment.areas_for_improvement || '',
        career_aspirations: mySelfAssessment.career_aspirations || '',
        challenges_faced: mySelfAssessment.challenges_faced || '',
        achievements: mySelfAssessment.achievements || '',
        training_completed: mySelfAssessment.training_completed || '',
        training_requested: mySelfAssessment.training_requested || '',
        goals_achieved: mySelfAssessment.goals_achieved || '',
        goals_for_next_period: mySelfAssessment.goals_for_next_period || '',
        competency_ratings: mySelfAssessment.competency_ratings || [],
      });
    }
  }, [mySelfAssessment]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompetencyRatingChange = (ratings) => {
    setFormData((prev) => ({ ...prev, competency_ratings: ratings }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDraft(mySelfAssessment.id, formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submit(mySelfAssessment.id);
      navigate('/reviews/self-assessment/view');
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset this assessment to draft?')) {
      await resetToDraft(mySelfAssessment.id);
      fetchMy();
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading self assessment..." />;
  if (error) return <ReviewError error={error} onRetry={fetchMy} />;
  if (!activeCycle) {
    return (
      <div className="self-assessment-no-cycle">
        <AlertCircle size={48} />
        <h2>No Active Review Cycle</h2>
        <p>There is currently no active review cycle for self assessment.</p>
      </div>
    );
  }

  const isSubmitted = mySelfAssessment?.status === 'submitted';
  const isDraft = mySelfAssessment?.status === 'draft' || !mySelfAssessment;
  const canEdit = isDraft || activeCycle.allow_self_assessment_edit;

  if (isSubmitted && !activeCycle.allow_self_assessment_edit) {
    return <SelfAssessmentView assessment={mySelfAssessment} onReset={handleReset} />;
  }

  return (
    <div className="self-assessment-form">
      <div className="self-assessment-form-header">
        <div className="self-assessment-form-title-section">
          <h1 className="self-assessment-form-title">Self Assessment</h1>
          <div className="self-assessment-form-badges">
            <ReviewStatusBadge status={mySelfAssessment?.status || 'draft'} />
            {activeCycle && (
              <span className="self-assessment-form-deadline">
                <Clock size={14} />
                Deadline: {new Date(activeCycle.self_assessment_deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="self-assessment-form-actions">
          {isDraft && (
            <>
              <button
                className="btn btn-outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <Send size={18} />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </>
          )}
          {isSubmitted && canEdit && (
            <>
              <button
                className="btn btn-outline"
                onClick={handleReset}
              >
                <Clock size={18} />
                Reset to Draft
              </button>
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <Send size={18} />
                {isSubmitting ? 'Submitting...' : 'Resubmit'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="self-assessment-form-content">
        <SelfAssessmentProgress
          assessment={mySelfAssessment}
          cycle={activeCycle}
        />

        <div className="self-assessment-form-sections">
          <SelfAssessmentCompetencyRating
            ratings={formData.competency_ratings}
            onChange={handleCompetencyRatingChange}
            disabled={!canEdit}
          />

          <SelfAssessmentComment
            label="Overall Comment"
            field="overall_comment"
            value={formData.overall_comment}
            onChange={handleChange}
            disabled={!canEdit}
            placeholder="Provide an overall summary of your performance..."
          />

          <div className="self-assessment-form-grid">
            <SelfAssessmentComment
              label="Strengths"
              field="strengths"
              value={formData.strengths}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="What are your key strengths?"
            />
            <SelfAssessmentComment
              label="Areas for Improvement"
              field="areas_for_improvement"
              value={formData.areas_for_improvement}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="What areas would you like to improve?"
            />
          </div>

          <div className="self-assessment-form-grid">
            <SelfAssessmentComment
              label="Career Aspirations"
              field="career_aspirations"
              value={formData.career_aspirations}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="What are your career goals?"
            />
            <SelfAssessmentComment
              label="Challenges Faced"
              field="challenges_faced"
              value={formData.challenges_faced}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="What challenges did you face?"
            />
          </div>

          <SelfAssessmentComment
            label="Key Achievements"
            field="achievements"
            value={formData.achievements}
            onChange={handleChange}
            disabled={!canEdit}
            placeholder="List your key achievements..."
          />

          <div className="self-assessment-form-grid">
            <SelfAssessmentComment
              label="Training Completed"
              field="training_completed"
              value={formData.training_completed}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="What training have you completed?"
            />
            <SelfAssessmentComment
              label="Training Requested"
              field="training_requested"
              value={formData.training_requested}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="What training would you like?"
            />
          </div>

          <div className="self-assessment-form-grid">
            <SelfAssessmentComment
              label="Goals Achieved"
              field="goals_achieved"
              value={formData.goals_achieved}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="What goals did you achieve?"
            />
            <SelfAssessmentComment
              label="Goals for Next Period"
              field="goals_for_next_period"
              value={formData.goals_for_next_period}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="What are your goals for the next period?"
            />
          </div>
        </div>

        {!canEdit && (
          <div className="self-assessment-form-readonly">
            <CheckCircle size={20} />
            This assessment has been submitted and is read-only.
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfAssessmentForm;