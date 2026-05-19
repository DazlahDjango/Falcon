// src/components/reviews/finalRating/FinalRatingDetail.jsx
import React from 'react';
import './finalRating.css';

const FinalRatingDetail = ({ 
    rating, 
    onApprove, 
    onLock, 
    onCalibrate, 
    canManage = false,
    isHr = false
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getTrafficLightClass = (score) => {
        if (score >= 80) return 'traffic-light-green';
        if (score >= 60) return 'traffic-light-yellow';
        return 'traffic-light-red';
    };

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
            case 'pending': return 'Pending Calibration';
            case 'calibrated': return 'Calibrated';
            case 'approved': return 'Approved';
            case 'locked': return 'Locked (Final)';
            default: return rating.status;
        }
    };

    const canApprove = (rating.status === 'calibrated' || rating.status === 'pending') && (isHr || canManage);
    const canLock = rating.status === 'approved' && (isHr || canManage);
    const canCalibrate = rating.status === 'pending' && (isHr || canManage);

    const scoreBreakdown = [
        { label: 'KPI Score', value: rating.kpi_score, weight: rating.review_cycle?.kpi_weight },
        { label: 'Competency Score', value: rating.competency_score, weight: rating.review_cycle?.competency_weight },
        { label: 'Mission Report', value: rating.mission_score, weight: rating.review_cycle?.mission_weight },
        { label: 'Task Completion', value: rating.task_score, weight: rating.review_cycle?.task_weight },
        { label: '360 Feedback', value: rating.feedback_score, weight: rating.review_cycle?.feedback_weight },
    ].filter(item => item.value !== null && item.value !== undefined);

    if (!rating) {
        return <div className="finalrating-loading">Loading rating details...</div>;
    }

    return (
        <div className="finalrating-detail">
            <div className="finalrating-detail-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="finalrating-title">
                            {rating.employee_name || rating.employee?.name}
                        </h2>
                        <div style={{ marginTop: '0.5rem' }}>
                            <span className={`finalrating-status-badge ${getStatusClass()}`}>
                                {getStatusLabel()}
                            </span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="finalrating-card-score" style={{ fontSize: '2rem' }}>
                            <span className={getTrafficLightClass(rating.final_score)}>
                                {rating.final_score ? `${rating.final_score}%` : 'N/A'}
                            </span>
                        </div>
                        <div className="finalrating-card-rating" style={{ background: rating.final_rating_color || '#e5e7eb', padding: '0.25rem 1rem', marginTop: '0.5rem' }}>
                            {rating.final_rating_label || 'Not Rated'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="finalrating-detail-section">
                <h3 className="finalrating-section-title">Score Breakdown</h3>
                <div className="score-breakdown">
                    {scoreBreakdown.map((item, index) => (
                        <div key={index} className="score-breakdown-item">
                            <span className="score-breakdown-label">
                                {item.label} {item.weight ? `(${item.weight}%)` : ''}
                            </span>
                            <span className="score-breakdown-value">{item.value}%</span>
                        </div>
                    ))}
                    <div className="score-breakdown-item">
                        <span className="score-breakdown-label">Raw Total</span>
                        <span className="score-breakdown-value">{rating.raw_total_score}%</span>
                    </div>
                    {rating.coefficient_applied !== 1.0 && (
                        <div className="score-breakdown-item">
                            <span className="score-breakdown-label">Coefficient (x{rating.coefficient_applied})</span>
                            <span className="score-breakdown-value">{rating.adjusted_score}%</span>
                        </div>
                    )}
                    {rating.calibration_adjustment !== 0 && (
                        <div className="score-breakdown-item">
                            <span className="score-breakdown-label">Calibration Adjustment</span>
                            <span className="score-breakdown-value" style={{ color: rating.calibration_adjustment > 0 ? '#10b981' : '#ef4444' }}>
                                {rating.calibration_adjustment > 0 ? '+' : ''}{rating.calibration_adjustment}%
                            </span>
                        </div>
                    )}
                    <div className="score-breakdown-total">
                        <span>Final Score</span>
                        <span className={getTrafficLightClass(rating.final_score)}>
                            {rating.final_score}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="finalrating-detail-section">
                <h3 className="finalrating-section-title">Cycle Information</h3>
                <div className="finalrating-info-grid">
                    <div className="finalrating-info-item">
                        <span className="finalrating-info-label">Review Cycle</span>
                        <span className="finalrating-info-value">{rating.review_cycle_name}</span>
                    </div>
                    <div className="finalrating-info-item">
                        <span className="finalrating-info-label">Rating Scale</span>
                        <span className="finalrating-info-value">{rating.rating_scale_name}</span>
                    </div>
                    {rating.calibration_adjustment_reason && (
                        <div className="finalrating-info-item">
                            <span className="finalrating-info-label">Calibration Reason</span>
                            <span className="finalrating-info-value">{rating.calibration_adjustment_reason}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="finalrating-detail-section">
                <h3 className="finalrating-section-title">Recommendations</h3>
                <div className="finalrating-info-grid">
                    <div className="finalrating-info-item">
                        <span className="finalrating-info-label">Promotion</span>
                        <span className="finalrating-info-value">
                            {rating.promotion_recommended ? '✓ Recommended' : 'Not Recommended'}
                        </span>
                    </div>
                    {rating.promotion_recommended && rating.promotion_target_role && (
                        <>
                            <div className="finalrating-info-item">
                                <span className="finalrating-info-label">Target Role</span>
                                <span className="finalrating-info-value">{rating.promotion_target_role}</span>
                            </div>
                            <div className="finalrating-info-item">
                                <span className="finalrating-info-label">Timeline</span>
                                <span className="finalrating-info-value">{rating.promotion_timeline}</span>
                            </div>
                        </>
                    )}
                    <div className="finalrating-info-item">
                        <span className="finalrating-info-label">PIP</span>
                        <span className="finalrating-info-value">
                            {rating.pip_recommended ? '⚠️ Recommended' : 'Not Required'}
                        </span>
                    </div>
                    {rating.bonus_percentage && (
                        <div className="finalrating-info-item">
                            <span className="finalrating-info-label">Bonus</span>
                            <span className="finalrating-info-value">{rating.bonus_percentage}%</span>
                        </div>
                    )}
                </div>
            </div>

            {(canApprove || canLock || canCalibrate) && (
                <div className="finalrating-detail-section">
                    <h3 className="finalrating-section-title">Actions</h3>
                    <div className="form-actions" style={{ marginTop: 0 }}>
                        {canCalibrate && (
                            <button className="btn-warning" onClick={() => onCalibrate(rating.id)}>
                                Calibrate Rating
                            </button>
                        )}
                        {canApprove && (
                            <button className="btn-success" onClick={() => onApprove(rating.id)}>
                                Approve Rating
                            </button>
                        )}
                        {canLock && (
                            <button className="btn-primary" onClick={() => onLock(rating.id)}>
                                Lock as Final
                            </button>
                        )}
                    </div>
                </div>
            )}

            {rating.approved_by && (
                <div className="finalrating-detail-section">
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Approved by {rating.approved_by} on {formatDate(rating.approved_at)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinalRatingDetail;