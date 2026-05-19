// src/components/reviews/assessment/SupervisorReviewForm.jsx
import React, { useState } from 'react';
import './assessment.css';

const SupervisorReviewForm = ({ 
    review, 
    selfAssessment,
    competencies = [], 
    ratings = [],
    onSubmit, 
    onSaveDraft,
    isSubmitting = false,
    readOnly = false 
}) => {
    const [formData, setFormData] = useState({
        overall_comment: review?.overall_comment || '',
        performance_summary: review?.performance_summary || '',
        strengths_observed: review?.strengths_observed || '',
        development_areas: review?.development_areas || '',
        achievements_recognized: review?.achievements_recognized || '',
        career_progression_notes: review?.career_progression_notes || '',
        training_recommendations: review?.training_recommendations || '',
        goals_for_next_period: review?.goals_for_next_period || '',
        recommendation: review?.recommendation || 'retain',
        promotion_readiness: review?.promotion_readiness || false,
        promotion_target_role: review?.promotion_target_role || '',
        promotion_timeline: review?.promotion_timeline || '',
        bonus_recommendation: review?.bonus_recommendation || 'standard',
        bonus_percentage: review?.bonus_percentage || '',
        override_kpi_score: review?.override_kpi_score || '',
        override_reason: review?.override_reason || '',
    });

    const [competencyRatings, setCompetencyRatings] = useState(
        ratings.reduce((acc, r) => ({ ...acc, [r.competency_id]: r.raw_score }), {})
    );

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRatingChange = (competencyId, value) => {
        setCompetencyRatings(prev => ({ ...prev, [competencyId]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            competency_ratings: competencies.map(comp => ({
                competency_id: comp.id,
                raw_score: competencyRatings[comp.id] || null,
            })),
        };
        onSubmit(submitData);
    };

    const handleSaveDraft = () => {
        const draftData = {
            ...formData,
            competency_ratings: competencies.map(comp => ({
                competency_id: comp.id,
                raw_score: competencyRatings[comp.id] || null,
            })),
        };
        onSaveDraft(draftData);
    };

    const isCompleted = review?.status === 'approved';

    if (readOnly || isCompleted) {
        return <SupervisorReviewView review={review} competencies={competencies} ratings={ratings} selfAssessment={selfAssessment} />;
    }

    return (
        <form className="assessment-form" onSubmit={handleSubmit}>
            {/* Self Assessment Reference */}
            {selfAssessment && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Employee Self Assessment</h3>
                    </div>
                    <div className="assessment-section-body">
                        <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selfAssessment.overall_comment || 'No self assessment provided'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Competency Ratings */}
            {competencies.length > 0 && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Competency Assessment</h3>
                        <span>Rate employee on a scale of 1-5</span>
                    </div>
                    <div className="assessment-section-body">
                        <table className="competency-table">
                            <thead>
                                <tr>
                                    <th>Competency</th>
                                    <th style={{ width: '100px' }}>Self Rating</th>
                                    <th style={{ width: '100px' }}>Manager Rating</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competencies.map(comp => {
                                    const selfRating = selfAssessment?.competency_ratings?.find(r => r.competency_id === comp.id)?.raw_score;
                                    return (
                                        <tr key={comp.id}>
                                            <td><strong>{comp.name}</strong></td>
                                            <td>{selfRating || '-'} / 5</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="competency-rating-input"
                                                    min="1"
                                                    max="5"
                                                    step={1}
                                                    value={competencyRatings[comp.id] || ''}
                                                    onChange={(e) => handleRatingChange(comp.id, parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>{comp.description}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Performance Assessment */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Performance Assessment</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Overall Comment</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.overall_comment}
                            onChange={(e) => handleChange('overall_comment', e.target.value)}
                            placeholder="Overall assessment of employee's performance..."
                            rows="3"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Performance Summary</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.performance_summary}
                            onChange={(e) => handleChange('performance_summary', e.target.value)}
                            placeholder="Detailed summary of performance..."
                            rows="3"
                        />
                    </div>
                </div>
            </div>

            {/* Strengths & Development */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Observations</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Strengths Observed</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.strengths_observed}
                            onChange={(e) => handleChange('strengths_observed', e.target.value)}
                            placeholder="What are the employee's key strengths?"
                            rows="2"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Areas for Development</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.development_areas}
                            onChange={(e) => handleChange('development_areas', e.target.value)}
                            placeholder="What areas need improvement?"
                            rows="2"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Achievements Recognized</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.achievements_recognized}
                            onChange={(e) => handleChange('achievements_recognized', e.target.value)}
                            placeholder="Notable achievements worth recognizing"
                            rows="2"
                        />
                    </div>
                </div>
            </div>

            {/* Future Planning */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Future Planning</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Career Progression Notes</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.career_progression_notes}
                            onChange={(e) => handleChange('career_progression_notes', e.target.value)}
                            placeholder="Notes on employee's career trajectory"
                            rows="2"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Training Recommendations</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.training_recommendations}
                            onChange={(e) => handleChange('training_recommendations', e.target.value)}
                            placeholder="Recommended training or development programs"
                            rows="2"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Goals for Next Period</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.goals_for_next_period}
                            onChange={(e) => handleChange('goals_for_next_period', e.target.value)}
                            placeholder="Goals set for the employee for next period"
                            rows="2"
                        />
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Recommendations</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Recommendation</label>
                        <select
                            className="assessment-field-select"
                            value={formData.recommendation}
                            onChange={(e) => handleChange('recommendation', e.target.value)}
                        >
                            <option value="promote">Promote</option>
                            <option value="retain">Retain in Current Role</option>
                            <option value="pip">Place on Performance Improvement Plan</option>
                            <option value="demote">Demote</option>
                            <option value="terminate">Terminate</option>
                        </select>
                    </div>

                    <div className="assessment-field">
                        <label className="assessment-field-label">
                            <input
                                type="checkbox"
                                checked={formData.promotion_readiness}
                                onChange={(e) => handleChange('promotion_readiness', e.target.checked)}
                                style={{ marginRight: '0.5rem' }}
                            />
                            Ready for Promotion
                        </label>
                    </div>

                    {formData.promotion_readiness && (
                        <>
                            <div className="assessment-field">
                                <label className="assessment-field-label">Target Promotion Role</label>
                                <input
                                    type="text"
                                    className="assessment-field-input"
                                    value={formData.promotion_target_role}
                                    onChange={(e) => handleChange('promotion_target_role', e.target.value)}
                                    placeholder="e.g., Senior Manager"
                                />
                            </div>
                            <div className="assessment-field">
                                <label className="assessment-field-label">Promotion Timeline</label>
                                <input
                                    type="text"
                                    className="assessment-field-input"
                                    value={formData.promotion_timeline}
                                    onChange={(e) => handleChange('promotion_timeline', e.target.value)}
                                    placeholder="e.g., Next quarter, Within 6 months"
                                />
                            </div>
                        </>
                    )}

                    <div className="assessment-field">
                        <label className="assessment-field-label">Bonus Recommendation</label>
                        <select
                            className="assessment-field-select"
                            value={formData.bonus_recommendation}
                            onChange={(e) => handleChange('bonus_recommendation', e.target.value)}
                        >
                            <option value="exceptional">Exceptional Bonus</option>
                            <option value="standard">Standard Bonus</option>
                            <option value="reduced">Reduced Bonus</option>
                            <option value="none">No Bonus</option>
                        </select>
                    </div>

                    {(formData.bonus_recommendation === 'exceptional' || formData.bonus_recommendation === 'standard') && (
                        <div className="assessment-field">
                            <label className="assessment-field-label">Bonus Percentage (%)</label>
                            <input
                                type="number"
                                className="assessment-field-input"
                                value={formData.bonus_percentage}
                                onChange={(e) => handleChange('bonus_percentage', e.target.value)}
                                placeholder="e.g., 10"
                                min="0"
                                max="200"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Override */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">KPI Score Override</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Override KPI Score (if data is incorrect)</label>
                        <input
                            type="number"
                            className="assessment-field-input"
                            value={formData.override_kpi_score}
                            onChange={(e) => handleChange('override_kpi_score', e.target.value)}
                            placeholder="Override score (0-100)"
                            min="0"
                            max="100"
                        />
                    </div>
                    {formData.override_kpi_score && (
                        <div className="assessment-field">
                            <label className="assessment-field-label">Reason for Override</label>
                            <textarea
                                className="assessment-field-textarea"
                                value={formData.override_reason}
                                onChange={(e) => handleChange('override_reason', e.target.value)}
                                placeholder="Why are you overriding the KPI score?"
                                rows="2"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="assessment-actions">
                <button type="button" className="btn-secondary" onClick={handleSaveDraft} disabled={isSubmitting}>
                    Save Draft
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </form>
    );
};

export default SupervisorReviewForm;