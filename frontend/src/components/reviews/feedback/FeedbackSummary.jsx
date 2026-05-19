// src/components/reviews/feedback/FeedbackSummary.jsx
import React from 'react';
import './feedback.css';

const FeedbackSummary = ({ summary, onShare, canShare = false }) => {
    const formatNumber = (num) => {
        if (num === null || num === undefined) return 'N/A';
        return num.toFixed(1);
    };

    if (!summary) {
        return <div className="feedback-loading">No feedback summary available</div>;
    }

    const ratingBreakdown = [
        { label: 'Manager', value: summary.avg_manager_rating },
        { label: 'Peer', value: summary.avg_peer_rating },
        { label: 'Subordinate', value: summary.avg_subordinate_rating },
        { label: 'Cross-Department', value: summary.avg_cross_dept_rating },
    ];

    return (
        <div className="feedback-summary">
            <div className="feedback-summary-header">
                <h3>360° Feedback Summary</h3>
                <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                    Based on {summary.total_responses} responses
                </p>
                {canShare && !summary.is_shared_with_subject && (
                    <button className="btn-primary" onClick={onShare} style={{ marginTop: '1rem' }}>
                        Share Summary with Employee
                    </button>
                )}
                {summary.is_shared_with_subject && (
                    <div style={{ marginTop: '1rem', color: '#10b981', fontSize: '0.875rem' }}>
                        ✓ Shared with employee on {new Date(summary.shared_at).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div className="feedback-summary-section">
                <div className="average-rating">
                    <div className="average-rating-value">{formatNumber(summary.overall_avg_rating)}</div>
                    <div className="average-rating-label">Overall Average Rating</div>
                </div>
            </div>

            <div className="feedback-summary-section">
                <h4 className="feedback-summary-title">Rating Breakdown by Reviewer Type</h4>
                <div className="rating-breakdown">
                    {ratingBreakdown.map(item => (
                        item.value !== null && (
                            <div key={item.label} className="rating-breakdown-item">
                                <div className="rating-breakdown-label">{item.label}</div>
                                <div className="rating-breakdown-bar">
                                    <div 
                                        className="rating-breakdown-fill" 
                                        style={{ width: `${(item.value / 5) * 100}%` }}
                                    />
                                </div>
                                <div className="rating-breakdown-value">{formatNumber(item.value)}/5</div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {summary.common_strengths && summary.common_strengths.length > 0 && (
                <div className="feedback-summary-section">
                    <h4 className="feedback-summary-title">Common Strengths</h4>
                    <div className="common-feedback">
                        {summary.common_strengths.slice(0, 10).map((strength, index) => (
                            <span key={index} className="feedback-tag">{strength}</span>
                        ))}
                    </div>
                </div>
            )}

            {summary.common_improvements && summary.common_improvements.length > 0 && (
                <div className="feedback-summary-section">
                    <h4 className="feedback-summary-title">Common Areas for Improvement</h4>
                    <div className="common-feedback">
                        {summary.common_improvements.slice(0, 10).map((improvement, index) => (
                            <span key={index} className="feedback-tag">{improvement}</span>
                        ))}
                    </div>
                </div>
            )}

            {summary.anonymized_responses && summary.anonymized_responses.length > 0 && (
                <div className="feedback-summary-section">
                    <h4 className="feedback-summary-title">Individual Responses (Anonymized)</h4>
                    {summary.anonymized_responses.map((response, index) => (
                        <div key={index} className="feedback-response-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span className="feedback-tag">{response.reviewer_type_display || response.reviewer_type}</span>
                                {response.overall_rating && (
                                    <span>Rating: {response.overall_rating}/5</span>
                                )}
                            </div>
                            {response.strengths && (
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                                    <strong>Strengths:</strong> {response.strengths}
                                </p>
                            )}
                            {response.areas_for_improvement && (
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                                    <strong>Areas for Improvement:</strong> {response.areas_for_improvement}
                                </p>
                            )}
                            {response.suggestions && (
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                                    <strong>Suggestions:</strong> {response.suggestions}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackSummary;