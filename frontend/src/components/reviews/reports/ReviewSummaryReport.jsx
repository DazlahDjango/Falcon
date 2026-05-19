// src/components/reviews/reports/ReviewSummaryReport.jsx
import React from 'react';
import './reports.css';
import ExportButton from './ExportButton';

const ReviewSummaryReport = ({ summary, loading, onExport }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getTrafficLightClass = (score) => {
        if (score >= 80) return 'traffic-green';
        if (score >= 60) return 'traffic-yellow';
        return 'traffic-red';
    };

    if (loading) {
        return <div className="report-loading">Loading report...</div>;
    }

    if (!summary) {
        return (
            <div className="report-empty">
                <p>No review summary available.</p>
            </div>
        );
    }

    return (
        <div className="report-container">
            <div className="report-header">
                <div>
                    <h2 className="report-title">Review Summary Report</h2>
                    <p className="report-subtitle">
                        {summary.employee?.name} - {summary.review_cycle?.name}
                    </p>
                </div>
                <div className="report-actions">
                    <ExportButton onExport={onExport} />
                </div>
            </div>

            {/* Final Rating Section */}
            {summary.final_rating && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Final Rating</h3>
                    </div>
                    <div className="report-card-body">
                        <div className="summary-stats">
                            <div className="summary-stat-card">
                                <div className={`summary-stat-value ${getTrafficLightClass(summary.final_rating.final_score)}`}>
                                    {summary.final_rating.final_score}%
                                </div>
                                <div className="summary-stat-label">Final Score</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">
                                    {summary.final_rating.final_rating_label || 'Not Rated'}
                                </div>
                                <div className="summary-stat-label">Rating</div>
                            </div>
                            {summary.final_rating.promotion_recommended && (
                                <div className="summary-stat-card">
                                    <div className="summary-stat-value">✓</div>
                                    <div className="summary-stat-label">Promotion Recommended</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Self Assessment Section */}
            {summary.self_assessment && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Self Assessment</h3>
                        <span className="report-status">{summary.self_assessment.status}</span>
                    </div>
                    <div className="report-card-body">
                        {summary.self_assessment.overall_comment && (
                            <div className="report-section">
                                <div className="report-section-title">Overall Comment</div>
                                <p>{summary.self_assessment.overall_comment}</p>
                            </div>
                        )}
                        <div className="report-section">
                            <div className="report-section-title">Strengths</div>
                            <p>{summary.self_assessment.strengths || 'No strengths provided'}</p>
                        </div>
                        <div className="report-section">
                            <div className="report-section-title">Areas for Improvement</div>
                            <p>{summary.self_assessment.areas_for_improvement || 'No areas identified'}</p>
                        </div>
                        {summary.self_assessment.achievements && (
                            <div className="report-section">
                                <div className="report-section-title">Key Achievements</div>
                                <p>{summary.self_assessment.achievements}</p>
                            </div>
                        )}
                        <div className="report-section">
                            <div className="report-section-title">Career Aspirations</div>
                            <p>{summary.self_assessment.career_aspirations || 'Not specified'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Supervisor Review Section */}
            {summary.supervisor_review && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Manager Review</h3>
                        <span>{summary.supervisor_review.supervisor?.name}</span>
                    </div>
                    <div className="report-card-body">
                        {summary.supervisor_review.overall_comment && (
                            <div className="report-section">
                                <div className="report-section-title">Manager Comments</div>
                                <p>{summary.supervisor_review.overall_comment}</p>
                            </div>
                        )}
                        <div className="report-section">
                            <div className="report-section-title">Strengths Observed</div>
                            <p>{summary.supervisor_review.strengths_observed || 'No strengths noted'}</p>
                        </div>
                        <div className="report-section">
                            <div className="report-section-title">Development Areas</div>
                            <p>{summary.supervisor_review.development_areas || 'No development areas noted'}</p>
                        </div>
                        <div className="report-section">
                            <div className="report-section-title">Recommendation</div>
                            <p>{summary.supervisor_review.recommendation || 'No recommendation'}</p>
                        </div>
                        {summary.supervisor_review.promotion_readiness && (
                            <div className="report-section">
                                <div className="report-section-title">Promotion Readiness</div>
                                <p>Ready for {summary.supervisor_review.promotion_target_role || 'promotion'} ({summary.supervisor_review.promotion_timeline || 'timeline TBD'})</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Competency Comparison */}
            {summary.competency_comparison && summary.competency_comparison.length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Competency Assessment Comparison</h3>
                    </div>
                    <div className="report-card-body">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Competency</th>
                                    <th>Self Rating</th>
                                    <th>Manager Rating</th>
                                    <th>Gap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.competency_comparison.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.competency}</td>
                                        <td>{item.self_score || '-'}/5</td>
                                        <td>{item.supervisor_score || '-'}/5</td>
                                        <td className={item.gap > 0 ? 'traffic-red' : item.gap < 0 ? 'traffic-green' : ''}>
                                            {item.gap ? (item.gap > 0 ? `+${item.gap}` : item.gap) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Feedback Summary */}
            {summary.feedback_summary && summary.feedback_summary.total_responses > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">360° Feedback Summary</h3>
                        <span>{summary.feedback_summary.total_responses} responses</span>
                    </div>
                    <div className="report-card-body">
                        <div className="summary-stats">
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{summary.feedback_summary.overall_avg_rating || '-'}</div>
                                <div className="summary-stat-label">Overall Average</div>
                            </div>
                            {summary.feedback_summary.avg_manager_rating && (
                                <div className="summary-stat-card">
                                    <div className="summary-stat-value">{summary.feedback_summary.avg_manager_rating}</div>
                                    <div className="summary-stat-label">Manager</div>
                                </div>
                            )}
                            {summary.feedback_summary.avg_peer_rating && (
                                <div className="summary-stat-card">
                                    <div className="summary-stat-value">{summary.feedback_summary.avg_peer_rating}</div>
                                    <div className="summary-stat-label">Peer</div>
                                </div>
                            )}
                        </div>
                        {summary.feedback_summary.common_strengths?.length > 0 && (
                            <div className="report-section">
                                <div className="report-section-title">Common Strengths</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {summary.feedback_summary.common_strengths.map((strength, i) => (
                                        <span key={i} style={{ background: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                                            {strength}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Timeline */}
            {summary.timeline && summary.timeline.length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Review Timeline</h3>
                    </div>
                    <div className="report-card-body">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.timeline.map((event, index) => (
                                    <tr key={index}>
                                        <td>{event.event}</td>
                                        <td>{formatDate(event.date)}</td>
                                        <td>{event.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewSummaryReport;