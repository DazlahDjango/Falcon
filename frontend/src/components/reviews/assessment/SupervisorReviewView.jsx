// src/components/reviews/assessment/SupervisorReviewView.jsx
import React from 'react';
import './assessment.css';

const SupervisorReviewView = ({ review, competencies = [], ratings = [], selfAssessment = null }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Not submitted';
        return new Date(dateString).toLocaleDateString();
    };

    const getRecommendationLabel = (rec) => {
        const labels = {
            promote: 'Promote',
            retain: 'Retain',
            pip: 'Performance Improvement Plan',
            demote: 'Demote',
            terminate: 'Terminate',
        };
        return labels[rec] || rec;
    };

    const getBonusLabel = (bonus) => {
        const labels = {
            exceptional: 'Exceptional Bonus',
            standard: 'Standard Bonus',
            reduced: 'Reduced Bonus',
            none: 'No Bonus',
        };
        return labels[bonus] || bonus;
    };

    const getRatingValue = (competencyId, isSelf = false) => {
        if (isSelf && selfAssessment?.competency_ratings) {
            const rating = selfAssessment.competency_ratings.find(r => r.competency_id === competencyId);
            return rating?.raw_score || '-';
        }
        const rating = ratings.find(r => r.competency_id === competencyId);
        return rating?.raw_score || '-';
    };

    if (!review) {
        return <div className="assessment-loading">No supervisor review found</div>;
    }

    return (
        <div className="assessment-container">
            <div className="assessment-header">
                <div>
                    <h2 className="assessment-title">Supervisor Review</h2>
                    <p className="assessment-subtitle">
                        Status: {review.status} | 
                        Submitted: {formatDate(review.submitted_at)}
                    </p>
                </div>
            </div>

            {/* Competency Ratings Comparison */}
            {competencies.length > 0 && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Competency Assessment</h3>
                    </div>
                    <div className="assessment-section-body">
                        <table className="competency-table">
                            <thead>
                                <tr>
                                    <th>Competency</th>
                                    <th style={{ width: '100px' }}>Self Rating</th>
                                    <th style={{ width: '100px' }}>Manager Rating</th>
                                    <th>Gap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competencies.map(comp => {
                                    const selfRating = getRatingValue(comp.id, true);
                                    const managerRating = getRatingValue(comp.id);
                                    const gap = selfRating !== '-' && managerRating !== '-' ? managerRating - selfRating : null;
                                    return (
                                        <tr key={comp.id}>
                                            <td><strong>{comp.name}</strong></td>
                                            <td>{selfRating} / 5</td>
                                            <td>{managerRating} / 5</td>
                                            <td>
                                                {gap !== null && (
                                                    <span className={gap > 0 ? 'comparison-gap-negative' : gap < 0 ? 'comparison-gap-positive' : 'comparison-gap-neutral'}>
                                                        {gap > 0 ? `+${gap}` : gap}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Overall Assessment */}
            {(review.overall_comment || review.performance_summary) && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Overall Assessment</h3>
                    </div>
                    <div className="assessment-section-body">
                        {review.overall_comment && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Overall Comment:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{review.overall_comment}</p>
                            </div>
                        )}
                        {review.performance_summary && (
                            <div>
                                <strong>Performance Summary:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{review.performance_summary}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Observations */}
            {(review.strengths_observed || review.development_areas || review.achievements_recognized) && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Manager Observations</h3>
                    </div>
                    <div className="assessment-section-body">
                        {review.strengths_observed && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Strengths Observed:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{review.strengths_observed}</p>
                            </div>
                        )}
                        {review.development_areas && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Areas for Development:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{review.development_areas}</p>
                            </div>
                        )}
                        {review.achievements_recognized && (
                            <div>
                                <strong>Achievements Recognized:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{review.achievements_recognized}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Recommendations</h3>
                </div>
                <div className="assessment-section-body">
                    <div className="assessment-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div>
                            <div className="assessment-info-label">Recommendation</div>
                            <div className="assessment-info-value">{getRecommendationLabel(review.recommendation)}</div>
                        </div>
                        <div>
                            <div className="assessment-info-label">Promotion Readiness</div>
                            <div className="assessment-info-value">{review.promotion_readiness ? 'Yes' : 'No'}</div>
                        </div>
                        {review.promotion_readiness && (
                            <>
                                <div>
                                    <div className="assessment-info-label">Target Role</div>
                                    <div className="assessment-info-value">{review.promotion_target_role || '-'}</div>
                                </div>
                                <div>
                                    <div className="assessment-info-label">Timeline</div>
                                    <div className="assessment-info-value">{review.promotion_timeline || '-'}</div>
                                </div>
                            </>
                        )}
                        <div>
                            <div className="assessment-info-label">Bonus Recommendation</div>
                            <div className="assessment-info-value">{getBonusLabel(review.bonus_recommendation)}</div>
                        </div>
                        {review.bonus_percentage && (
                            <div>
                                <div className="assessment-info-label">Bonus Percentage</div>
                                <div className="assessment-info-value">{review.bonus_percentage}%</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Override */}
            {review.override_kpi_score && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">KPI Score Override</h3>
                    </div>
                    <div className="assessment-section-body">
                        <div className="assessment-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <div className="assessment-info-label">Override Score</div>
                                <div className="assessment-info-value">{review.override_kpi_score}%</div>
                            </div>
                            <div>
                                <div className="assessment-info-label">Reason</div>
                                <div className="assessment-info-value">{review.override_reason}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorReviewView;