// src/components/reviews/finalRating/FinalRatingCard.jsx
import React from 'react';
import './finalRating.css';

const FinalRatingCard = ({ rating, onClick }) => {
    const getStatusClass = () => {
        switch (rating.status) {
            case 'pending': return 'finalrating-status-pending';
            case 'calibrated': return 'finalrating-status-calibrated';
            case 'approved': return 'finalrating-status-approved';
            case 'locked': return 'finalrating-status-locked';
            default: return 'finalrating-status-pending';
        }
    };

    const getStatusLabel = () => {
        switch (rating.status) {
            case 'pending': return 'Pending';
            case 'calibrated': return 'Calibrated';
            case 'approved': return 'Approved';
            case 'locked': return 'Locked';
            default: return rating.status;
        }
    };

    const getTrafficLightClass = (score) => {
        if (score >= 80) return 'traffic-light-green';
        if (score >= 60) return 'traffic-light-yellow';
        return 'traffic-light-red';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="finalrating-card" onClick={() => onClick?.(rating.id)}>
            <div className="finalrating-card-header">
                <div>
                    <div className="finalrating-card-employee">
                        {rating.employee_name || rating.employee?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {rating.review_cycle_name}
                    </div>
                </div>
                <div className="finalrating-card-score">
                    <span className={getTrafficLightClass(rating.final_score)}>
                        {rating.final_score ? `${rating.final_score}%` : 'N/A'}
                    </span>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span className={`finalrating-card-rating`} style={{ background: rating.final_rating_color || '#e5e7eb', color: '#1f2937' }}>
                    {rating.final_rating_label || 'Not Rated'}
                </span>
                <span className={`finalrating-status-badge ${getStatusClass()}`}>
                    {getStatusLabel()}
                </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                {rating.promotion_recommended && <span style={{ marginRight: '0.5rem' }}>🎯 Promotion</span>}
                {rating.pip_recommended && <span>⚠️ PIP Recommended</span>}
            </div>
            {rating.approved_at && (
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    Approved: {formatDate(rating.approved_at)}
                </div>
            )}
        </div>
    );
};

export default FinalRatingCard;