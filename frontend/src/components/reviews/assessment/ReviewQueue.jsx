// src/components/reviews/assessment/ReviewQueue.jsx
import React, { useState } from 'react';
import './assessment.css';
import ReviewQueueCard from './ReviewQueueCard';

const ReviewQueue = ({ 
    reviews = [], 
    loading = false, 
    onReview,
    onView,
    isManager = false,
    title = "Review Queue"
}) => {
    const [filter, setFilter] = useState('all');

    const filteredReviews = reviews.filter(review => {
        if (filter === 'all') return true;
        return review.status === filter;
    });

    const stats = {
        total: reviews.length,
        submitted: reviews.filter(r => r.status === 'submitted').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        draft: reviews.filter(r => r.status === 'draft').length,
    };

    if (loading) {
        return <div className="assessment-loading">Loading review queue...</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="assessment-empty">
                <p>No reviews in queue.</p>
            </div>
        );
    }

    return (
        <div className="assessment-container">
            <div className="assessment-header">
                <div>
                    <h2 className="assessment-title">{title}</h2>
                    <p className="assessment-subtitle">Reviews pending your attention</p>
                </div>
            </div>

            <div className="review-queue-stats">
                <div className="review-queue-stat">
                    <div className="review-queue-stat-value">{stats.total}</div>
                    <div className="review-queue-stat-label">Total</div>
                </div>
                <div className="review-queue-stat">
                    <div className="review-queue-stat-value">{stats.submitted}</div>
                    <div className="review-queue-stat-label">Pending Review</div>
                </div>
                <div className="review-queue-stat">
                    <div className="review-queue-stat-value">{stats.approved}</div>
                    <div className="review-queue-stat-label">Approved</div>
                </div>
            </div>

            <div className="review-queue-filters" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                    className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('all')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    All
                </button>
                <button 
                    className={filter === 'submitted' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('submitted')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    Pending
                </button>
                <button 
                    className={filter === 'approved' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setFilter('approved')}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    Approved
                </button>
            </div>

            <div className="review-queue">
                {filteredReviews.map(review => (
                    <ReviewQueueCard
                        key={review.id}
                        review={review}
                        onReview={onReview}
                        onView={onView}
                        isManager={isManager}
                    />
                ))}
            </div>

            {filteredReviews.length === 0 && (
                <div className="assessment-empty">
                    <p>No reviews match the selected filter.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewQueue;