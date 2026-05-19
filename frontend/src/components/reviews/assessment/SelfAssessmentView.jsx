// src/components/reviews/assessment/SelfAssessmentView.jsx
import React from 'react';
import './assessment.css';

const SelfAssessmentView = ({ assessment, competencies = [], ratings = [] }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Not submitted';
        return new Date(dateString).toLocaleDateString();
    };

    const getRatingValue = (competencyId) => {
        const rating = ratings.find(r => r.competency_id === competencyId);
        return rating?.raw_score || 'Not rated';
    };

    if (!assessment) {
        return <div className="assessment-loading">No self assessment found</div>;
    }

    const isSubmitted = assessment.status === 'submitted';

    return (
        <div className="assessment-container">
            <div className="assessment-header">
                <div>
                    <h2 className="assessment-title">Self Assessment</h2>
                    <p className="assessment-subtitle">
                        Status: {isSubmitted ? 'Submitted' : 'Draft'} | 
                        Submitted: {formatDate(assessment.submitted_at)}
                    </p>
                </div>
            </div>

            {/* Competency Ratings */}
            {competencies.length > 0 && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Competency Self-Ratings</h3>
                    </div>
                    <div className="assessment-section-body">
                        <table className="competency-table">
                            <thead>
                                <tr>
                                    <th>Competency</th>
                                    <th style={{ width: '100px' }}>Self Rating</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competencies.map(comp => (
                                    <tr key={comp.id}>
                                        <td><strong>{comp.name}</strong></td>
                                        <td>{getRatingValue(comp.id)} / 5</td>
                                        <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>{comp.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Overall Comment */}
            {assessment.overall_comment && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Overall Comment</h3>
                    </div>
                    <div className="assessment-section-body">
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{assessment.overall_comment}</p>
                    </div>
                </div>
            )}

            {/* Strengths & Achievements */}
            {(assessment.strengths || assessment.achievements) && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Strengths & Achievements</h3>
                    </div>
                    <div className="assessment-section-body">
                        {assessment.strengths && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Key Strengths:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.strengths}</p>
                            </div>
                        )}
                        {assessment.achievements && (
                            <div>
                                <strong>Key Achievements:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.achievements}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Development Areas */}
            {(assessment.areas_for_improvement || assessment.challenges_faced) && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Development Areas</h3>
                    </div>
                    <div className="assessment-section-body">
                        {assessment.areas_for_improvement && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Areas for Improvement:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.areas_for_improvement}</p>
                            </div>
                        )}
                        {assessment.challenges_faced && (
                            <div>
                                <strong>Challenges Faced:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.challenges_faced}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Career & Training */}
            {(assessment.career_aspirations || assessment.training_completed || assessment.training_requested) && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Career & Training</h3>
                    </div>
                    <div className="assessment-section-body">
                        {assessment.career_aspirations && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Career Aspirations:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.career_aspirations}</p>
                            </div>
                        )}
                        {assessment.training_completed && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Training Completed:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.training_completed}</p>
                            </div>
                        )}
                        {assessment.training_requested && (
                            <div>
                                <strong>Training Requested:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.training_requested}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Goals */}
            {(assessment.goals_achieved || assessment.goals_for_next_period) && (
                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h3 className="assessment-section-title">Goals</h3>
                    </div>
                    <div className="assessment-section-body">
                        {assessment.goals_achieved && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Goals Achieved:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.goals_achieved}</p>
                            </div>
                        )}
                        {assessment.goals_for_next_period && (
                            <div>
                                <strong>Goals for Next Period:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{assessment.goals_for_next_period}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelfAssessmentView;