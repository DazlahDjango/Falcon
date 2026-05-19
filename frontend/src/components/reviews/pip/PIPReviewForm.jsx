// src/components/reviews/pip/PIPReviewForm.jsx
import React, { useState } from 'react';
import './pip.css';

const PIPReviewForm = ({ onSubmit, isLoading = false }) => {
    const [formData, setFormData] = useState({
        rating: 'satisfactory',
        summary: '',
        accomplishments: '',
        challenges: '',
        action_items: '',
        employee_attended: true,
    });

    const ratingOptions = [
        { value: 'no_progress', label: 'No Progress - Critical', color: '#ef4444' },
        { value: 'minimal', label: 'Minimal Progress - Concern', color: '#f59e0b' },
        { value: 'satisfactory', label: 'Satisfactory Progress - On Track', color: '#3b82f6' },
        { value: 'good', label: 'Good Progress - Ahead', color: '#10b981' },
        { value: 'excellent', label: 'Excellent - Exceeding', color: '#10b981' },
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        // Reset form
        setFormData({
            rating: 'satisfactory',
            summary: '',
            accomplishments: '',
            challenges: '',
            action_items: '',
            employee_attended: true,
        });
    };

    const getRatingClass = (ratingValue) => {
        if (ratingValue === 'no_progress') return 'no-progress';
        if (ratingValue === 'excellent') return 'excellent';
        return '';
    };

    return (
        <form className="pip-review-form" onSubmit={handleSubmit}>
            <h4 style={{ marginBottom: '1rem' }}>Add Progress Review</h4>
            
            <div className="form-group">
                <label className="form-label">Progress Rating</label>
                <div className="review-rating-buttons">
                    {ratingOptions.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`review-rating-btn ${formData.rating === opt.value ? 'selected' : ''} ${getRatingClass(opt.value)}`}
                            onClick={() => handleChange('rating', opt.value)}
                            style={formData.rating === opt.value ? { background: opt.color, borderColor: opt.color } : {}}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label required">Summary</label>
                <textarea
                    className="form-textarea"
                    value={formData.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    rows="3"
                    placeholder="Summary of progress, challenges, and next steps"
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Accomplishments</label>
                <textarea
                    className="form-textarea"
                    value={formData.accomplishments}
                    onChange={(e) => handleChange('accomplishments', e.target.value)}
                    rows="2"
                    placeholder="What has the employee accomplished?"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Challenges</label>
                <textarea
                    className="form-textarea"
                    value={formData.challenges}
                    onChange={(e) => handleChange('challenges', e.target.value)}
                    rows="2"
                    placeholder="What challenges are being faced?"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Action Items</label>
                <textarea
                    className="form-textarea"
                    value={formData.action_items}
                    onChange={(e) => handleChange('action_items', e.target.value)}
                    rows="2"
                    placeholder="Next action items from this review"
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    <input
                        type="checkbox"
                        checked={formData.employee_attended}
                        onChange={(e) => handleChange('employee_attended', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                    />
                    Employee attended the review meeting
                </label>
            </div>

            <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Review'}
                </button>
            </div>
        </form>
    );
};

export default PIPReviewForm;