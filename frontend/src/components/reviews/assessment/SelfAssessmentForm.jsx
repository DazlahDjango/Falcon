// src/components/reviews/assessment/SelfAssessmentForm.jsx
import React, { useState } from 'react';
import './assessment.css';

const SelfAssessmentForm = ({ 
    assessment, 
    competencies = [], 
    ratings = [],
    onSubmit, 
    onSaveDraft,
    isSubmitting = false,
    readOnly = false 
}) => {
    const [formData, setFormData] = useState({
        overall_comment: assessment?.overall_comment || '',
        strengths: assessment?.strengths || '',
        areas_for_improvement: assessment?.areas_for_improvement || '',
        career_aspirations: assessment?.career_aspirations || '',
        challenges_faced: assessment?.challenges_faced || '',
        achievements: assessment?.achievements || '',
        training_completed: assessment?.training_completed || '',
        training_requested: assessment?.training_requested || '',
        goals_achieved: assessment?.goals_achieved || '',
        goals_for_next_period: assessment?.goals_for_next_period || '',
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

    const isCompleted = assessment?.status === 'submitted';

    if (readOnly || isCompleted) {
        return <SelfAssessmentView assessment={assessment} competencies={competencies} ratings={ratings} />;
    }

    return (
        <form className="assessment-form" onSubmit={handleSubmit}>
            {/* Competency Ratings Section */}
            {competencies.length > 0 && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Competency Self-Rating</h3>
                        <span className="assessment-section-subtitle">Rate yourself on a scale of 1-5</span>
                    </div>
                    <div className="assessment-section-body">
                        <table className="competency-table">
                            <thead>
                                <tr>
                                    <th>Competency</th>
                                    <th style={{ width: '120px' }}>Rating (1-5)</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competencies.map(comp => (
                                    <tr key={comp.id}>
                                        <td><strong>{comp.name}</strong></td>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Narrative Sections */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Overall Performance</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Overall Comment</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.overall_comment}
                            onChange={(e) => handleChange('overall_comment', e.target.value)}
                            placeholder="Summarize your overall performance during this period..."
                            rows="4"
                        />
                    </div>
                </div>
            </div>

            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Strengths & Achievements</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Key Strengths</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.strengths}
                            onChange={(e) => handleChange('strengths', e.target.value)}
                            placeholder="What are your key strengths? What do you do well?"
                            rows="3"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Key Achievements</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.achievements}
                            onChange={(e) => handleChange('achievements', e.target.value)}
                            placeholder="What are your key achievements this period?"
                            rows="3"
                        />
                    </div>
                </div>
            </div>

            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Development Areas</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Areas for Improvement</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.areas_for_improvement}
                            onChange={(e) => handleChange('areas_for_improvement', e.target.value)}
                            placeholder="What areas need improvement? What skills would you like to develop?"
                            rows="3"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Challenges Faced</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.challenges_faced}
                            onChange={(e) => handleChange('challenges_faced', e.target.value)}
                            placeholder="What challenges did you face and how did you address them?"
                            rows="3"
                        />
                    </div>
                </div>
            </div>

            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Career & Training</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Career Aspirations</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.career_aspirations}
                            onChange={(e) => handleChange('career_aspirations', e.target.value)}
                            placeholder="What are your career goals? What role do you aspire to?"
                            rows="2"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Training Completed</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.training_completed}
                            onChange={(e) => handleChange('training_completed', e.target.value)}
                            placeholder="What training or certifications have you completed?"
                            rows="2"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Training Requested</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.training_requested}
                            onChange={(e) => handleChange('training_requested', e.target.value)}
                            placeholder="What training or development support would you like?"
                            rows="2"
                        />
                    </div>
                </div>
            </div>

            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Goals</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-field">
                        <label className="assessment-field-label">Goals Achieved</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.goals_achieved}
                            onChange={(e) => handleChange('goals_achieved', e.target.value)}
                            placeholder="What goals did you achieve this period?"
                            rows="2"
                        />
                    </div>
                    <div className="assessment-field">
                        <label className="assessment-field-label">Goals for Next Period</label>
                        <textarea
                            className="assessment-field-textarea"
                            value={formData.goals_for_next_period}
                            onChange={(e) => handleChange('goals_for_next_period', e.target.value)}
                            placeholder="What are your goals for the next review period?"
                            rows="2"
                        />
                    </div>
                </div>
            </div>

            <div className="assessment-actions">
                <button type="button" className="btn-secondary" onClick={handleSaveDraft} disabled={isSubmitting}>
                    Save Draft
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </button>
            </div>
        </form>
    );
};

export default SelfAssessmentForm;