import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, Clock, AlertCircle, CheckCircle, Eye, Edit3, Trash2 } from 'lucide-react';
import { useSelfAssessment, useCycles } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import SelfAssessmentCompetencyRating from './SelfAssessmentCompetencyRating';
import SelfAssessmentComment from './SelfAssessmentComment';
import SelfAssessmentProgress from './SelfAssessmentProgress';
import SelfAssessmentView from '../detail/SelfAssessmentView';
import SelfAssessmentHelpGuide from './SelfAssessmentHelpGuide';

const SelfAssessmentForm = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { mySelfAssessment, selected, loading, error, clearErrors, fetchMy, fetchOne, submit, saveDraft, resetToDraft, remove } = useSelfAssessment();
  const { data: allCycles = [], activeCycle, fetchActiveCycle, fetchAll: fetchAllCycles } = useCycles();
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
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('');
  const [showGuide, setShowGuide] = useState(true);
  const isDataLoadedRef = useRef(false);
  const lastLoadedIdRef = useRef(null);

  const activeAssessment = (paramId && selected && (String(selected.id) === String(paramId))) 
    ? selected 
    : mySelfAssessment;

  const effectiveCycle = activeCycle || (activeAssessment?.review_cycle ? {
    id: activeAssessment.review_cycle,
    name: activeAssessment.review_cycle_name,
    self_assessment_deadline: activeAssessment.self_assessment_deadline || activeAssessment.review_cycle_deadline,
    allow_self_assessment_edit: true,
  } : (allCycles || []).find(c => c.status === 'submitted' || c.status === 'active') || null);

  const isSubmitted = activeAssessment?.status === 'submitted';
  const isDraft = activeAssessment?.status === 'draft' || !activeAssessment;
  const canEdit = isDraft || isEditing || (effectiveCycle ? effectiveCycle.allow_self_assessment_edit : false);

  useEffect(() => {
    const initData = async () => {
      try {
        if (clearErrors) clearErrors();
        if (paramId) {
          await fetchOne(paramId);
        } else {
          await fetchMy();
        }
      } catch (err) {
        console.warn('Initial self-assessment fetch failed:', err);
      }
      try {
        if (fetchActiveCycle) await fetchActiveCycle();
      } catch (err) {
        console.warn('Initial active cycle fetch failed:', err);
      }
      try {
        if (fetchAllCycles) await fetchAllCycles();
      } catch (err) {
        console.warn('Initial cycle list fetch failed:', err);
      }
    };
    initData();
  }, [paramId, fetchOne, fetchMy, fetchActiveCycle, fetchAllCycles, clearErrors]);

  useEffect(() => {
    if (activeAssessment && activeAssessment.id && (!isDataLoadedRef.current || lastLoadedIdRef.current !== activeAssessment.id)) {
      lastLoadedIdRef.current = activeAssessment.id;
      setFormData({
        overall_comment: activeAssessment.overall_comment || '',
        strengths: activeAssessment.strengths || '',
        areas_for_improvement: activeAssessment.areas_for_improvement || '',
        career_aspirations: activeAssessment.career_aspirations || '',
        challenges_faced: activeAssessment.challenges_faced || '',
        achievements: activeAssessment.achievements || '',
        training_completed: activeAssessment.training_completed || '',
        training_requested: activeAssessment.training_requested || '',
        goals_achieved: activeAssessment.goals_achieved || '',
        goals_for_next_period: activeAssessment.goals_for_next_period || '',
        competency_ratings: activeAssessment.competency_ratings || [],
      });
      // Mark as loaded so autosave only triggers on subsequent user changes
      setTimeout(() => {
        isDataLoadedRef.current = true;
      }, 500);
    }
  }, [activeAssessment]);

  // Debounced autosave effect
  useEffect(() => {
    if (!canEdit || !activeAssessment?.id || isSubmitted || !isDataLoadedRef.current) return;

    const hasChanges = 
      formData.overall_comment !== (activeAssessment.overall_comment || '') ||
      formData.strengths !== (activeAssessment.strengths || '') ||
      formData.areas_for_improvement !== (activeAssessment.areas_for_improvement || '') ||
      formData.career_aspirations !== (activeAssessment.career_aspirations || '') ||
      formData.challenges_faced !== (activeAssessment.challenges_faced || '') ||
      formData.achievements !== (activeAssessment.achievements || '') ||
      formData.training_completed !== (activeAssessment.training_completed || '') ||
      formData.training_requested !== (activeAssessment.training_requested || '') ||
      formData.goals_achieved !== (activeAssessment.goals_achieved || '') ||
      formData.goals_for_next_period !== (activeAssessment.goals_for_next_period || '') ||
      JSON.stringify(formData.competency_ratings) !== JSON.stringify(activeAssessment.competency_ratings || []);

    if (!hasChanges) return;

    setAutosaveStatus('Saving changes...');

    const timer = setTimeout(async () => {
      try {
        await saveDraft(activeAssessment.id, formData);
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setAutosaveStatus(`Draft saved at ${timeString}`);
      } catch (err) {
        console.error('Autosave failed:', err);
        setAutosaveStatus('Autosave failed. Check connection.');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, activeAssessment, saveDraft, canEdit, isSubmitted]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompetencyRatingChange = (ratings) => {
    setFormData((prev) => ({ ...prev, competency_ratings: ratings }));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (activeAssessment?.id) {
        await saveDraft(activeAssessment.id, formData);
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setAutosaveStatus(`Draft saved at ${timeString}`);
      }
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let targetId = activeAssessment?.id;
      if (!targetId) {
        const fresh = paramId ? await fetchOne(paramId) : await fetchMy();
        targetId = fresh?.id || fresh?.payload?.id;
      }
      if (targetId) {
        await saveDraft(targetId, formData);
        await submit(targetId);
        if (paramId) {
          await fetchOne(paramId);
        } else {
          await fetchMy();
        }
        setIsEditing(false);
        setIsViewingDetails(false);
        alert('🎉 Your self-assessment has been successfully submitted!');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit self assessment: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const targetId = paramId || activeAssessment?.id;
    if (!targetId) return;
    if (window.confirm('Are you sure you want to permanently delete this self-assessment draft? All entered responses will be removed.')) {
      try {
        await remove(targetId);
        alert('Self-assessment draft deleted successfully.');
        navigate('/reviews/self-assessments');
      } catch (err) {
        alert('Failed to delete: ' + (err.response?.data?.error || err.message || 'Permission denied'));
      }
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset this assessment to draft?')) {
      if (activeAssessment?.id) {
        await resetToDraft(activeAssessment.id);
        setIsEditing(true);
        setIsViewingDetails(false);
        if (paramId) {
          fetchOne(paramId);
        } else {
          fetchMy();
        }
      }
    }
  };

  const handleRetry = async () => {
    if (clearErrors) clearErrors();
    try {
      await fetchMy();
      if (fetchActiveCycle) await fetchActiveCycle();
      if (fetchAllCycles) await fetchAllCycles();
    } catch (e) {
      console.error('Retry failed:', e);
    }
  };

  if (loading && (!mySelfAssessment || !mySelfAssessment.id)) return <ReviewLoading size="lg" text="Loading self assessment..." />;
  if (error && (!mySelfAssessment || !mySelfAssessment.id)) return <ReviewError error={error} onRetry={handleRetry} />;
  if (!effectiveCycle && (!mySelfAssessment || !mySelfAssessment.id)) {
    return (
      <div className="self-assessment-no-cycle">
        <AlertCircle size={48} />
        <h2>No Active Review Cycle</h2>
        <p>There is currently no active review cycle for self assessment.</p>
      </div>
    );
  }

  // Once submitted: Show the clean Overview Card first. User can click "View Full Submission" or "Edit"
  if (isSubmitted && !isEditing) {
    if (isViewingDetails) {
      return (
        <SelfAssessmentView 
          assessment={mySelfAssessment} 
          onEdit={() => { setIsViewingDetails(false); setIsEditing(true); }} 
          onBack={() => setIsViewingDetails(false)}
          onReset={handleReset} 
          onDelete={handleDelete}
        />
      );
    }

    return (
      <div className="self-assessment-overview-wrapper" style={{ padding: '24px 16px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Self-Assessment Submitted</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                Your self-evaluation for <strong>{mySelfAssessment.review_cycle_name || effectiveCycle?.name || 'Active Review Cycle'}</strong> is confirmed and submitted.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '28px', border: '1px solid #f1f5f9' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
              <div style={{ marginTop: '4px' }}><ReviewStatusBadge status={mySelfAssessment.status} /></div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Submitted Date</span>
              <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                {mySelfAssessment.submitted_at ? new Date(mySelfAssessment.submitted_at).toLocaleDateString() : 'Submitted'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Competencies Rated</span>
              <div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 600, color: '#2563eb' }}>
                {mySelfAssessment.competency_ratings?.length || 0} Competencies
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsViewingDetails(true)}
              style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#2563eb', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            >
              <Eye size={18} />
              View Full Assessment
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            >
              <Edit3 size={18} />
              Edit Assessment
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
              title="Reset to draft to modify"
            >
              <Clock size={16} />
              Reset to Draft
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="self-assessment-form">
      <div className="self-assessment-form-header">
        <div className="self-assessment-form-title-section">
          <h1 className="self-assessment-form-title">Self Assessment</h1>
          <div className="self-assessment-form-badges">
            <ReviewStatusBadge status={mySelfAssessment?.status || 'draft'} />
            {effectiveCycle?.self_assessment_deadline && (
              <span className="self-assessment-form-deadline">
                <Clock size={14} />
                Deadline: {new Date(effectiveCycle.self_assessment_deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="self-assessment-form-actions">
          {isEditing && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditing(false)}
              style={{ marginRight: '8px' }}
            >
              Cancel Editing
            </button>
          )}
          {canEdit && !isEditing && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowGuide(!showGuide)}
              style={{ marginRight: '8px' }}
            >
              {showGuide ? 'Hide Guide' : 'Show Guide'}
            </button>
          )}
          {autosaveStatus && (
            <span className="self-assessment-autosave-status">
              {autosaveStatus}
            </span>
          )}
          {(isDraft || isEditing) && (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSaveDraft}
                disabled={isSaving || isSubmitting}
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitting || isSaving}
              >
                <Send size={18} />
                {isSubmitting ? 'Submitting...' : (isEditing ? 'Save & Submit' : 'Submit')}
              </button>
              {activeAssessment?.id && (
                <button
                  type="button"
                  className="btn"
                  onClick={handleDelete}
                  style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', marginLeft: '4px' }}
                  title="Delete this draft self-assessment"
                >
                  <Trash2 size={16} />
                  Delete Draft
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className={showGuide ? "self-assessment-layout-grid" : ""}>
        <div className="self-assessment-form-content">
          <SelfAssessmentProgress
            assessment={mySelfAssessment}
            cycle={effectiveCycle}
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
        {showGuide && <SelfAssessmentHelpGuide />}
      </div>
    </div>
  );
};

export default SelfAssessmentForm;