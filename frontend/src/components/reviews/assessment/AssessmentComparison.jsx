// src/components/reviews/assessment/AssessmentComparison.jsx
import React from 'react';
import './assessment.css';

const AssessmentComparison = ({ selfAssessment, supervisorReview, competencies = [] }) => {
    if (!selfAssessment || !supervisorReview) {
        return <div className="assessment-empty">No comparison data available</div>;
    }

    const getSelfRating = (competencyId) => {
        const rating = selfAssessment.competency_ratings?.find(r => r.competency_id === competencyId);
        return rating?.raw_score || '-';
    };

    const getSupervisorRating = (competencyId) => {
        const rating = supervisorReview.competency_ratings?.find(r => r.competency_id === competencyId);
        return rating?.raw_score || '-';
    };

    const getGap = (competencyId) => {
        const self = getSelfRating(competencyId);
        const sup = getSupervisorRating(competencyId);
        if (self === '-' || sup === '-') return null;
        return sup - self;
    };

    const getGapClass = (gap) => {
        if (gap === null) return 'comparison-gap-neutral';
        if (gap > 0) return 'comparison-gap-negative';
        if (gap < 0) return 'comparison-gap-positive';
        return 'comparison-gap-neutral';
    };

    const getGapSymbol = (gap) => {
        if (gap === null) return 'N/A';
        if (gap > 0) return `+${gap}`;
        return gap;
    };

    const recommendations = [];
    
    // Identify areas for discussion
    competencies.forEach(comp => {
        const self = getSelfRating(comp.id);
        const sup = getSupervisorRating(comp.id);
        if (self !== '-' && sup !== '-' && Math.abs(sup - self) >= 1) {
            recommendations.push({
                competency: comp.name,
                selfRating: self,
                supervisorRating: sup,
                gap: sup - self,
                suggestion: sup > self 
                    ? "Manager rates higher than self. Discuss what employee missed."
                    : "Self rates higher than manager. Discuss expectations and evidence."
            });
        }
    });

    return (
        <div className="assessment-container">
            <div className="assessment-header">
                <h2 className="assessment-title">Assessment Comparison</h2>
                <p className="assessment-subtitle">
                    Comparing self-assessment with supervisor review
                </p>
            </div>

            {/* Comparison Table */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Competency Ratings Comparison</h3>
                </div>
                <div className="assessment-section-body">
                    <table className="competency-table">
                        <thead>
                            <tr>
                                <th>Competency</th>
                                <th style={{ width: '100px' }}>Self Rating</th>
                                <th style={{ width: '100px' }}>Manager Rating</th>
                                <th style={{ width: '80px' }}>Gap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {competencies.map(comp => {
                                const gap = getGap(comp.id);
                                return (
                                    <tr key={comp.id}>
                                        <td><strong>{comp.name}</strong></td>
                                        <td>{getSelfRating(comp.id)} / 5</td>
                                        <td>{getSupervisorRating(comp.id)} / 5</td>
                                        <td className={getGapClass(gap)}>
                                            {getGapSymbol(gap)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Areas for Discussion</h3>
                    </div>
                    <div className="assessment-section-body">
                        {recommendations.map((rec, index) => (
                            <div key={index} style={{ 
                                padding: '1rem', 
                                borderBottom: index < recommendations.length - 1 ? '1px solid #e5e7eb' : 'none',
                                background: index % 2 === 0 ? '#f9fafb' : 'white'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{rec.competency}</div>
                                <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    <span>Self: <strong>{rec.selfRating}/5</strong></span>
                                    <span>Manager: <strong>{rec.supervisorRating}/5</strong></span>
                                    <span className={rec.gap > 0 ? 'comparison-gap-negative' : 'comparison-gap-positive'}>
                                        Gap: {rec.gap > 0 ? `+${rec.gap}` : rec.gap}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    💡 {rec.suggestion}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="assessment-section">
                <div className="assessment-section-header">
                    <h3 className="assessment-section-title">Summary</h3>
                </div>
                <div className="assessment-section-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                                {competencies.filter(c => getSelfRating(c.id) !== '-').length}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rated Competencies</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                                {recommendations.length}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Areas to Discuss</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                                {recommendations.filter(r => Math.abs(r.gap) < 1).length}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Aligned Ratings</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentComparison;