// src/components/reviews/supervisor-reviews/form/SupervisorReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Send, User, Calendar, FileText, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { useSupervisorReview, useSelfAssessment } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import SupervisorReviewCompetencyRating from './SupervisorReviewCompetencyRating';
import SupervisorReviewComment from './SupervisorReviewComment';
import SupervisorReviewActions from './SupervisorReviewActions';

const SupervisorReviewForm = () => {
  const { employeeId, id } = useParams();
  const targetId = employeeId || id;
  const navigate = useNavigate();
  const { 
    selected, 
    loading, 
    error, 
    fetchOne, 
    create, 
    update, 
    submit, 
    saveDraft,
    comparison,
    compare,
  } = useSupervisorReview();
  const { mySelfAssessment } = useSelfAssessment();
  
  const [formData, setFormData] = useState({
    overall_comment: '',
    performance_summary: '',
    strengths_observed: '',
    development_areas: '',
    achievements_recognized: '',
    career_progression_notes: '',
    training_recommendations: '',
    goals_for_next_period: '',
    recommendation: '',
    promotion_readiness: '',
    promotion_target_role: '',
    promotion_timeline: '',
    bonus_recommendation: false,
    bonus_percentage: '',
    override_kpi_score: '',
    override_reason: '',
    competency_ratings: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (targetId) {
      fetchOne(targetId);
      compare(targetId);
    }
  }, [targetId, fetchOne, compare]);

  useEffect(() => {
    if (selected) {
      setFormData({
        overall_comment: selected.overall_comment || '',
        performance_summary: selected.performance_summary || '',
        strengths_observed: selected.strengths_observed || '',
        development_areas: selected.development_areas || '',
        achievements_recognized: selected.achievements_recognized || '',
        career_progression_notes: selected.career_progression_notes || '',
        training_recommendations: selected.training_recommendations || '',
        goals_for_next_period: selected.goals_for_next_period || '',
        recommendation: selected.recommendation || '',
        promotion_readiness: selected.promotion_readiness || '',
        promotion_target_role: selected.promotion_target_role || '',
        promotion_timeline: selected.promotion_timeline || '',
        bonus_recommendation: selected.bonus_recommendation || false,
        bonus_percentage: selected.bonus_percentage || '',
        override_kpi_score: selected.override_kpi_score || '',
        override_reason: selected.override_reason || '',
        competency_ratings: selected.competency_ratings || [],
      });
    }
  }, [selected]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompetencyRatingChange = (ratings) => {
    setFormData((prev) => ({ ...prev, competency_ratings: ratings }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (selected?.id) {
        if (saveDraft) {
          await saveDraft(selected.id, formData);
        } else {
          await update(selected.id, formData);
        }
      } else {
        await create({ ...formData, employee: targetId });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let reviewId = selected?.id;
      if (!reviewId) {
        const created = await create({ ...formData, employee: targetId });
        reviewId = created.id;
      } else {
        if (saveDraft) {
          await saveDraft(selected.id, formData);
        } else {
          await update(selected.id, formData);
        }
      }
      await submit(reviewId);
      navigate('/reviews/supervisor-reviews/queue');
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading review..." />;
  if (error) return <ReviewError error={error} onRetry={() => fetchOne(targetId)} />;

  const isSubmitted = selected?.status === 'submitted';
  const isApproved = selected?.status === 'approved';

  if (isApproved) {
    return (
      <div className="supervisor-review-approved">
        <AlertCircle size={48} />
        <h2>Review Already Approved</h2>
        <p>This review has been approved and cannot be modified.</p>
        <button className="btn btn-primary" onClick={() => navigate('/reviews/supervisor-reviews/queue')}>
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="supervisor-review-form">
      <div className="supervisor-review-form-header">
        <div className="supervisor-review-form-title-section">
          <h1 className="supervisor-review-form-title">Supervisor Review</h1>
          <div className="supervisor-review-form-badges">
            <ReviewStatusBadge status={selected?.status || 'draft'} />
            {selected?.employee_name && (
              <span className="supervisor-review-form-employee">
                <User size={14} />
                {selected.employee_name}
              </span>
            )}
          </div>
        </div>
        <div className="supervisor-review-form-actions">
          <button
            className="btn btn-outline"
            onClick={() => setShowComparison(!showComparison)}
          >
            <FileText size={18} />
            {showComparison ? 'Hide' : 'Show'} Comparison
          </button>
          {!isSubmitted && (
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
        </div>
      </div>

      {showComparison && comparison && (
        <div className="supervisor-review-comparison-section">
          <h3 className="supervisor-review-comparison-title">Self Assessment Comparison</h3>
          <div className="supervisor-review-comparison-grid">
            <div className="supervisor-review-comparison-self">
              <h4>Self Assessment</h4>
              <p>{comparison.self_assessment?.overall_comment || 'No self assessment available'}</p>
            </div>
            <div className="supervisor-review-comparison-supervisor">
              <h4>Your Review</h4>
              <p>{formData.overall_comment || 'No review yet'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="supervisor-review-form-content">
        <div className="supervisor-review-form-grid">
          <div className="supervisor-review-form-main">
            {/* KPI Performance Section (Read-Only from KPI Subsystem) */}
            <div className="supervisor-review-kpi-card" style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} style={{ color: '#3b82f6' }} />
                  <span style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>
                    KPI System Achievement (Read-Only)
                  </span>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: selected?.calculated_kpi_score >= 80 ? '#dcfce7' : selected?.calculated_kpi_score >= 60 ? '#fef9c3' : '#fee2e2',
                  color: selected?.calculated_kpi_score >= 80 ? '#166534' : selected?.calculated_kpi_score >= 60 ? '#854d0e' : '#991b1b',
                }}>
                  {selected?.calculated_kpi_score != null ? `${selected.calculated_kpi_score}% Performance` : 'No KPI Score Recorded'}
                </span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
                Quantitative targets and actuals are managed exclusively in the <strong>KPI Subsystem</strong>. The approved average score rolls up here into the review cycle.
              </p>
              {selected?.override_kpi_score != null && (
                <div style={{
                  fontSize: '13px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginTop: '8px'
                }}>
                  <strong>Supervisor KPI Override:</strong> {selected.override_kpi_score}% (Reason: {selected.override_reason || 'N/A'})
                </div>
              )}
            </div>

            <SupervisorReviewCompetencyRating
              ratings={formData.competency_ratings}
              onChange={handleCompetencyRatingChange}
              disabled={isSubmitted}
            />

            <SupervisorReviewComment
              label="Performance Summary"
              field="performance_summary"
              value={formData.performance_summary}
              onChange={handleChange}
              disabled={isSubmitted}
              placeholder="Summarize the employee's overall performance..."
            />

            <div className="supervisor-review-form-row">
              <SupervisorReviewComment
                label="Strengths Observed"
                field="strengths_observed"
                value={formData.strengths_observed}
                onChange={handleChange}
                disabled={isSubmitted}
                placeholder="What strengths have you observed?"
              />
              <SupervisorReviewComment
                label="Development Areas"
                field="development_areas"
                value={formData.development_areas}
                onChange={handleChange}
                disabled={isSubmitted}
                placeholder="What areas need development?"
              />
            </div>

            <SupervisorReviewComment
              label="Achievements Recognized"
              field="achievements_recognized"
              value={formData.achievements_recognized}
              onChange={handleChange}
              disabled={isSubmitted}
              placeholder="What achievements should be recognized?"
            />

            <div className="supervisor-review-form-row">
              <SupervisorReviewComment
                label="Career Progression Notes"
                field="career_progression_notes"
                value={formData.career_progression_notes}
                onChange={handleChange}
                disabled={isSubmitted}
                placeholder="Notes on career progression..."
              />
              <SupervisorReviewComment
                label="Training Recommendations"
                field="training_recommendations"
                value={formData.training_recommendations}
                onChange={handleChange}
                disabled={isSubmitted}
                placeholder="What training do you recommend?"
              />
            </div>

            <SupervisorReviewComment
              label="Goals for Next Period"
              field="goals_for_next_period"
              value={formData.goals_for_next_period}
              onChange={handleChange}
              disabled={isSubmitted}
              placeholder="What goals should be set for the next period?"
            />

            <SupervisorReviewComment
              label="Overall Comment"
              field="overall_comment"
              value={formData.overall_comment}
              onChange={handleChange}
              disabled={isSubmitted}
              placeholder="Provide your overall assessment..."
            />
          </div>

          <div className="supervisor-review-form-sidebar">
            <SupervisorReviewActions
              data={formData}
              onChange={handleChange}
              disabled={isSubmitted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorReviewForm;