// src/components/reviews/pip/PIPDetail.jsx
import React from 'react';
import './pip.css';
import PIPStatusBadge from './PIPStatusBadge';
import PIPProgressTracker from './PIPProgressTracker';
import PIPActionList from './PIPActionList';
import PIPReviewForm from './PIPReviewForm';

const PIPDetail = ({ 
    pip, 
    actions = [], 
    reviews = [],
    onEdit, 
    onApprove, 
    onExtend,
    onComplete,
    onAddAction,
    onCompleteAction,
    onAddReview,
    canManage = false,
    isManager = false,
    isHr = false
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const canApprove = pip.status === 'draft' && (isManager || isHr);
    const canExtend = pip.status === 'active' && (isManager || isHr);
    const canComplete = pip.status === 'active' && (isManager || isHr);
    const canEdit = (pip.status === 'draft' || pip.status === 'active') && (isManager || isHr);

    if (!pip) {
        return <div className="pip-loading">Loading PIP details...</div>;
    }

    return (
        <div className="pip-detail">
            <div className="pip-detail-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="pip-title">{pip.title}</h2>
                        <div style={{ marginTop: '0.5rem' }}>
                            <PIPStatusBadge status={pip.status} severity={pip.severity} showSeverity />
                        </div>
                    </div>
                    {canManage && (
                        <div className="pip-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {canApprove && (
                                <button className="btn-success" onClick={() => onApprove(pip.id)}>
                                    Approve PIP
                                </button>
                            )}
                            {canExtend && (
                                <button className="btn-warning" onClick={() => onExtend(pip.id)}>
                                    Extend Deadline
                                </button>
                            )}
                            {canComplete && (
                                <button className="btn-primary" onClick={() => onComplete(pip.id)}>
                                    Complete PIP
                                </button>
                            )}
                            {canEdit && (
                                <button className="btn-secondary" onClick={() => onEdit(pip.id)}>
                                    Edit
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="pip-detail-section">
                <h3 className="pip-section-title">PIP Information</h3>
                <div className="pip-info-grid">
                    <div className="pip-info-item">
                        <span className="pip-info-label">Employee</span>
                        <span className="pip-info-value">{pip.employee_name || pip.employee?.name}</span>
                    </div>
                    <div className="pip-info-item">
                        <span className="pip-info-label">Owner/Manager</span>
                        <span className="pip-info-value">{pip.owner_name || pip.owner?.name}</span>
                    </div>
                    <div className="pip-info-item">
                        <span className="pip-info-label">Period</span>
                        <span className="pip-info-value">{formatDate(pip.start_date)} - {formatDate(pip.end_date)}</span>
                    </div>
                    {pip.extended_to_date && (
                        <div className="pip-info-item">
                            <span className="pip-info-label">Extended To</span>
                            <span className="pip-info-value">{formatDate(pip.extended_to_date)}</span>
                        </div>
                    )}
                    <div className="pip-info-item">
                        <span className="pip-info-label">Days Remaining</span>
                        <span className="pip-info-value">{pip.days_remaining || 0} days</span>
                    </div>
                </div>
            </div>

            {pip.description && (
                <div className="pip-detail-section">
                    <h3 className="pip-section-title">Description</h3>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{pip.description}</p>
                </div>
            )}

            <div className="pip-detail-section">
                <h3 className="pip-section-title">Improvement Plan</h3>
                <div className="pip-info-grid">
                    <div className="pip-info-item">
                        <span className="pip-info-label">Improvement Areas</span>
                        <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{pip.improvement_areas}</p>
                    </div>
                    <div className="pip-info-item">
                        <span className="pip-info-label">Success Criteria</span>
                        <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{pip.success_criteria}</p>
                    </div>
                </div>
            </div>

            <div className="pip-detail-section">
                <h3 className="pip-section-title">Progress</h3>
                <PIPProgressTracker pip={pip} actions={actions} />
            </div>

            <div className="pip-detail-section">
                <h3 className="pip-section-title">Actions</h3>
                <PIPActionList 
                    actions={actions} 
                    onComplete={onCompleteAction}
                    onAdd={onAddAction}
                    canManage={canManage}
                    isManager={isManager}
                />
            </div>

            <div className="pip-detail-section">
                <h3 className="pip-section-title">Progress Reviews</h3>
                {reviews.length > 0 && (
                    <div className="pip-reviews-list">
                        {reviews.map(review => (
                            <div key={review.id} className="pip-review-item" style={{ 
                                padding: '1rem', 
                                borderBottom: '1px solid #e5e7eb',
                                background: '#f9fafb',
                                borderRadius: '0.5rem',
                                marginBottom: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{review.reviewer_name}</strong>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{formatDate(review.review_date)}</span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span className="pip-status-badge" style={{ background: review.rating === 'excellent' ? '#d1fae5' : '#f3f4f6' }}>
                                        Rating: {review.rating_display}
                                    </span>
                                </div>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{review.summary}</p>
                            </div>
                        ))}
                    </div>
                )}
                {(canManage || isManager) && (
                    <PIPReviewForm onSubmit={(data) => onAddReview(pip.id, data)} />
                )}
            </div>

            <div className="pip-detail-section">
                <h3 className="pip-section-title">Consequences</h3>
                <div className="pip-info-grid">
                    <div className="pip-info-item">
                        <span className="pip-info-label">If Failed</span>
                        <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap', color: '#dc2626' }}>
                            {pip.consequences_if_failed}
                        </p>
                    </div>
                    {pip.consequences_if_successful && (
                        <div className="pip-info-item">
                            <span className="pip-info-label">If Successful</span>
                            <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap', color: '#10b981' }}>
                                {pip.consequences_if_successful}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {pip.outcome && (
                <div className="pip-detail-section">
                    <h3 className="pip-section-title">Outcome</h3>
                    <div className={`pip-info-item ${pip.outcome === 'successful' ? 'text-success' : 'text-danger'}`}>
                        <span className="pip-info-label">Result</span>
                        <span className="pip-info-value" style={{ 
                            color: pip.outcome === 'successful' ? '#10b981' : '#ef4444',
                            fontWeight: 600
                        }}>
                            {pip.outcome === 'successful' ? '✓ Successfully Completed' : '✗ Failed - Action Required'}
                        </span>
                        {pip.outcome_notes && (
                            <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{pip.outcome_notes}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PIPDetail;