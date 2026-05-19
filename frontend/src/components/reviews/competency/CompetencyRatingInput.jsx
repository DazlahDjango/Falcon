// src/components/reviews/competency/CompetencyRatingInput.jsx
import React, { useState } from 'react';
import './competency.css';

const CompetencyRatingInput = ({ 
    competency, 
    initialRating = null, 
    initialComment = '',
    onRatingChange,
    readOnly = false,
    required = false
}) => {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);

    const handleRatingChange = (value) => {
        if (readOnly) return;
        setRating(value);
        onRatingChange?.(competency.id, value, comment);
    };

    const handleCommentChange = (value) => {
        if (readOnly) return;
        setComment(value);
        onRatingChange?.(competency.id, rating, value);
    };

    const ratingOptions = [1, 2, 3, 4, 5];
    const ratingLabels = {
        1: 'Needs Improvement',
        2: 'Below Expectations',
        3: 'Meets Expectations',
        4: 'Exceeds Expectations',
        5: 'Outstanding',
    };

    return (
        <div className="rating-input-container">
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                    {competency.name}
                    {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                </div>
                {competency.description && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {competency.description}
                    </div>
                )}
                {competency.excellent_behavior && rating === 5 && (
                    <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem' }}>
                        💡 {competency.excellent_behavior}
                    </div>
                )}
                {competency.needs_improvement_behavior && rating === 1 && (
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.25rem' }}>
                        ⚠️ {competency.needs_improvement_behavior}
                    </div>
                )}
            </div>
            
            <div className="rating-scale-buttons">
                {ratingOptions.map(value => (
                    <button
                        key={value}
                        type="button"
                        className={`rating-button ${rating === value ? 'selected' : ''}`}
                        onClick={() => handleRatingChange(value)}
                        disabled={readOnly}
                        title={ratingLabels[value]}
                    >
                        {value}
                    </button>
                ))}
            </div>
            
            <input
                type="text"
                className="rating-comment-input"
                placeholder="Add comment (optional)"
                value={comment}
                onChange={(e) => handleCommentChange(e.target.value)}
                disabled={readOnly}
            />
        </div>
    );
};

export default CompetencyRatingInput;