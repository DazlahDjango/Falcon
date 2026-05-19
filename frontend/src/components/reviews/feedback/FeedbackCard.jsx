// src/components/reviews/feedback/FeedbackCard.jsx
import React from 'react';
import './feedback.css';

const FeedbackCard = ({ feedback, onClick, type = 'request' }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getReviewerTypeClass = (reviewerType) => {
        switch (reviewerType) {
            case 'manager': return 'feedback-type-manager';
            case 'peer': return 'feedback-type-peer';
            case 'subordinate': return 'feedback-type-subordinate';
            case 'cross_dept': return 'feedback-type-cross_dept';
            default: return '';
        }
    };

    const getReviewerTypeLabel = (reviewerType) => {
        switch (reviewerType) {
            case 'manager': return 'Manager';
            case 'peer': return 'Peer';
            case 'subordinate': return 'Subordinate';
            case 'cross_dept': return 'Cross-Department';
            default: return reviewerType;
        }
    };

    if (type === 'request') {
        return (
            <div className="feedback-card" onClick={() => onClick?.(feedback.id)}>
                <div className="feedback-card-header">
                    <div>
                        <div className="feedback-card-subject">
                            Feedback for: {feedback.subject_name || feedback.subject?.name}
                        </div>
                        <div className="feedback-card-reviewer">
                            From: {feedback.reviewer_name || feedback.reviewer?.name}
                        </div>
                    </div>
                    <div>
                        <span className={`feedback-card-type ${getReviewerTypeClass(feedback.reviewer_type)}`}>
                            {getReviewerTypeLabel(feedback.reviewer_type)}
                        </span>
                        <span className={`feedback-status-badge ${feedback.status === 'completed' ? 'feedback-status-completed' : 'feedback-status-pending'}`} style={{ marginLeft: '0.5rem' }}>
                            {feedback.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Due: {formatDate(feedback.due_date)}
                </div>
                {feedback.is_anonymous && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        🔒 Anonymous feedback
                    </div>
                )}
                {feedback.is_required && (
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                        ⭐ Required for review cycle
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="feedback-card">
            <div className="feedback-card-header">
                <div>
                    <div className="feedback-card-subject">
                        Feedback from: {feedback.reviewer_name || feedback.reviewer?.name}
                    </div>
                    <div className="feedback-card-reviewer">
                        {feedback.reviewer_type_display}
                    </div>
                </div>
                {feedback.overall_rating && (
                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>
                        Rating: {feedback.overall_rating}/5
                    </div>
                )}
            </div>
            {feedback.strengths && (
                <div style={{ marginTop: '0.75rem' }}>
                    <strong>Strengths:</strong>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{feedback.strengths}</p>
                </div>
            )}
            {feedback.areas_for_improvement && (
                <div style={{ marginTop: '0.5rem' }}>
                    <strong>Areas for Improvement:</strong>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{feedback.areas_for_improvement}</p>
                </div>
            )}
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Submitted: {formatDate(feedback.submitted_at)}
            </div>
        </div>
    );
};

export default FeedbackCard;