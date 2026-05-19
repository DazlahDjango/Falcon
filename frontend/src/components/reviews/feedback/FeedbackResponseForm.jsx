// src/components/reviews/feedback/FeedbackResponseForm.jsx
import React, { useState } from 'react';
import './feedback.css';

const FeedbackResponseForm = ({ 
    request, 
    onSubmit, 
    onCancel, 
    isLoading = false 
}) => {
    const [formData, setFormData] = useState({
        overall_rating: '',
        strengths: '',
        areas_for_improvement: '',
        specific_examples: '',
        suggestions: '',
        additional_comments: '',
    });

    const [errors, setErrors] = useState({});

    const ratingOptions = [
        { value: 5, label: 'Excellent' },
        { value: 4, label: 'Very Good' },
        { value: 3, label: 'Good' },
        { value: 2, label: 'Fair' },
        { value: 1, label: 'Poor' },
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.overall_rating) {
            newErrors.overall_rating = 'Overall rating is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    if (!request) {
        return <div className="feedback-loading">Loading request details...</div>;
    }

    return (
        <form className="feedback-response-form" onSubmit={handleSubmit}>
            <div className="feedback-section" style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h4>Feedback Request Details</h4>
                <p><strong>Employee:</strong> {request.subject_name || request.subject?.name}</p>
                <p><strong>Review Cycle:</strong> {request.review_cycle_name || request.review_cycle?.name}</p>
                <p><strong>Due Date:</strong> {new Date(request.due_date).toLocaleDateString()}</p>
                {request.is_anonymous && <p><strong>Note:</strong> This feedback is anonymous. Your identity will not be shared.</p>}
            </div>

            <div className="form-group">
                <label className="form-label required">Overall Rating</label>
                <div className="rating-scale">
                    {ratingOptions.map(option => (
                        <label key={option.value} className={`rating-option ${formData.overall_rating === option.value ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="overall_rating"
                                value={option.value}
                                checked={formData.overall_rating === option.value}
                                onChange={(e) => handleChange('overall_rating', parseInt(e.target.value))}
                                style={{ display: 'none' }}
                            />
                            <div className="rating-value">{option.value}</div>
                            <div className="rating-label">{option.label}</div>
                        </label>
                    ))}
                </div>
                {errors.overall_rating && <div className="form-error">{errors.overall_rating}</div>}
            </div>

            <div className="form-group">
                <label className="form-label">Strengths</label>
                <textarea
                    className="form-textarea"
                    value={formData.strengths}
                    onChange={(e) => handleChange('strengths', e.target.value)}
                    rows="3"
                    placeholder="What does the subject do well? What are their key strengths?"
                />
                <div className="form-hint">Be specific and provide examples where possible</div>
            </div>

            <div className="form-group">
                <label className="form-label">Areas for Improvement</label>
                <textarea
                    className="form-textarea"
                    value={formData.areas_for_improvement}
                    onChange={(e) => handleChange('areas_for_improvement', e.target.value)}
                    rows="3"
                    placeholder="What could the subject improve? What skills need development?"
                />
                <div className="form-hint">Be constructive and focus on behaviors, not personality</div>
            </div>

            <div className="form-group">
                <label className="form-label">Specific Examples</label>
                <textarea
                    className="form-textarea"
                    value={formData.specific_examples}
                    onChange={(e) => handleChange('specific_examples', e.target.value)}
                    rows="2"
                    placeholder="Provide specific examples of the behavior or performance mentioned above"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Suggestions for Growth</label>
                <textarea
                    className="form-textarea"
                    value={formData.suggestions}
                    onChange={(e) => handleChange('suggestions', e.target.value)}
                    rows="2"
                    placeholder="What suggestions do you have for growth and development?"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Additional Comments</label>
                <textarea
                    className="form-textarea"
                    value={formData.additional_comments}
                    onChange={(e) => handleChange('additional_comments', e.target.value)}
                    rows="2"
                    placeholder="Any other feedback you'd like to share"
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </div>
        </form>
    );
};

export default FeedbackResponseForm;