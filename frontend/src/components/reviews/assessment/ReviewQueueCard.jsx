// src/components/reviews/assessment/ReviewQueueCard.jsx
import React from 'react';
import './assessment.css';

const ReviewQueueCard = ({ review, onReview, onView, isManager = false }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusClass = () => {
        switch (review.status) {
            case 'submitted': return 'status-submitted';
            case 'approved': return 'status-approved';
            default: return 'status-pending';
        }
    };

    const getStatusLabel = () => {
        switch (review.status) {
            case 'submitted': return 'Ready for Review';
            case 'approved': return 'Approved';
            default: return 'Draft';
        }
    };

    return (
        <div className="review-queue-card">
            <div className="review-queue-card-header">
                <div>
                    <div className="review-queue-card-employee">
                        {review.employee?.name || review.employee_name || 'Unknown Employee'}
                    </div>
                    <div className="review-queue-card-department">
                        {review.employee?.department?.name || review.department || 'No Department'}
                    </div>
                </div>
                <div className={`review-queue-card-status ${getStatusClass()}`}>
                    {getStatusLabel()}
                </div>
            </div>
            
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Submitted: {formatDate(review.submitted_at)}
            </div>
            
            {review.self_assessment_summary && (
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#4b5563' }}>
                    <strong>Self Summary:</strong> {review.self_assessment_summary.substring(0, 100)}...
                </div>
            )}
            
            <div className="review-queue-card-actions">
                {onView && (
                    <button className="btn-outline" onClick={() => onView(review.id)}>
                        View Details
                    </button>
                )}
                {isManager && review.status === 'submitted' && onReview && (
                    <button className="btn-primary" onClick={() => onReview(review.id)}>
                        Review
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReviewQueueCard;