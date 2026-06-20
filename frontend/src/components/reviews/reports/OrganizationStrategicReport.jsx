// src/components/reviews/reports/OrganizationStrategicReport.jsx
import React from 'react';
import ExportButton from './ExportButton';
import './reports.css';

export const OrganizationStrategicReport = ({ report, onExport }) => {
    if (!report) return null;

    const {
        cycle,
        overall_stats = {},
        rating_distribution = [],
        achievements = {},
        misses = {},
        remediation_plan = {},
        high_performers_at_risk = [],
        generated_at
    } = report;

    const formattedDate = generated_at ? new Date(generated_at).toLocaleString() : 'N/A';

    return (
        <div className="report-container">
            <div className="report-header">
                <div>
                    <h2 className="report-title">Organization Strategic Performance Report</h2>
                    <p className="report-subtitle">
                        Cycle: <strong>{cycle?.name || 'N/A'}</strong> ({cycle?.period || 'N/A'}) &middot; Generated: {formattedDate}
                    </p>
                </div>
                <div className="report-actions">
                    <ExportButton onExport={onExport} reportType="organization" />
                </div>
            </div>

            {/* Section 1: Executive Stats Grid */}
            <div className="summary-stats">
                <div className="summary-stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="summary-stat-value" style={{ color: '#1e3a8a', fontSize: '2rem' }}>
                        {overall_stats.avg_score}%
                    </div>
                    <div className="summary-stat-label">Company Average Score</div>
                </div>
                <div className="summary-stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="summary-stat-value" style={{ color: '#065f46' }}>
                        {overall_stats.avg_kpi_score}%
                    </div>
                    <div className="summary-stat-label">Average KPI Score (What)</div>
                </div>
                <div className="summary-stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div className="summary-stat-value" style={{ color: '#5b21b6' }}>
                        {overall_stats.avg_competency_score}%
                    </div>
                    <div className="summary-stat-label">Average Competency Score (How)</div>
                </div>
                <div className="summary-stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="summary-stat-value" style={{ color: '#92400e' }}>
                        {overall_stats.overall_completion}%
                    </div>
                    <div className="summary-stat-label">Cycle Completion Rate</div>
                </div>
            </div>

            {/* Bias Warning Alert */}
            {remediation_plan.bias_warning && (
                <div style={{
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                }}>
                    <strong style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ⚠️ {remediation_plan.bias_warning.title}
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f' }}>
                        {remediation_plan.bias_warning.message}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: '#78350f', fontStyle: 'italic' }}>
                        Recommendation: {remediation_plan.bias_warning.action}
                    </p>
                </div>
            )}

            {/* Section 2: Process Compliance & Target Phasing Check */}
            <div className="report-card">
                <div className="report-card-header">
                    <h4 className="report-card-title">Process Compliance & Submission Progress</h4>
                </div>
                <div className="report-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span>Employee Self-Assessments</span>
                            <strong>{overall_stats.self_assessment_completion}%</strong>
                        </div>
                        <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                            <div style={{ background: '#3b82f6', width: `${overall_stats.self_assessment_completion}%`, height: '100%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            <span>Supervisor Evaluations Approved</span>
                            <strong>{overall_stats.supervisor_review_completion}%</strong>
                        </div>
                        <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                            <div style={{ background: '#10b981', width: `${overall_stats.supervisor_review_completion}%`, height: '100%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Achievements & Gaps (Side by Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Excelling Strengths */}
                <div className="report-card" style={{ borderTop: '4px solid #10b981' }}>
                    <div className="report-card-header">
                        <h4 className="report-card-title" style={{ color: '#065f46' }}>🏆 Strategic Achievements</h4>
                    </div>
                    <div className="report-card-body">
                        <div className="report-section">
                            <h5 className="report-section-title">Top Behavioral Strengths</h5>
                            {achievements.strongest_competencies?.length > 0 ? (
                                <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                                    {achievements.strongest_competencies.map((c, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                            <strong>{c.name}</strong>: <span style={{ color: '#10b981', fontWeight: 600 }}>{c.score}/5.0</span> ({c.percentage}%)
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>No competency rating data available.</p>
                            )}
                        </div>

                        <div className="report-section" style={{ marginTop: '1.5rem' }}>
                            <h5 className="report-section-title">Excelling Departments</h5>
                            {achievements.excelling_departments?.length > 0 ? (
                                <table className="report-table" style={{ fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Average</th>
                                            <th>vs Company</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {achievements.excelling_departments.map((d, i) => (
                                            <tr key={i}>
                                                <td>{d.name}</td>
                                                <td><strong>{d.score}%</strong></td>
                                                <td style={{ color: '#10b981', fontWeight: 600 }}>+{d.variance}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>No department comparison statistics available.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Misses & Gaps */}
                <div className="report-card" style={{ borderTop: '4px solid #ef4444' }}>
                    <div className="report-card-header">
                        <h4 className="report-card-title" style={{ color: '#991b1b' }}>⚠️ Strategic Performance Gaps</h4>
                    </div>
                    <div className="report-card-body">
                        <div className="report-section">
                            <h5 className="report-section-title">Critical Skill Gaps (Bottom Competencies)</h5>
                            {misses.weakest_competencies?.length > 0 ? (
                                <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                                    {misses.weakest_competencies.map((c, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                            <strong>{c.name}</strong>: <span style={{ color: '#ef4444', fontWeight: 600 }}>{c.score}/5.0</span> ({c.percentage}%)
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>No competency rating data available.</p>
                            )}
                        </div>

                        <div className="report-section" style={{ marginTop: '1.5rem' }}>
                            <h5 className="report-section-title">Underperforming Departments</h5>
                            {misses.underperforming_departments?.length > 0 ? (
                                <table className="report-table" style={{ fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Average</th>
                                            <th>vs Company</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {misses.underperforming_departments.map((d, i) => (
                                            <tr key={i}>
                                                <td>{d.name}</td>
                                                <td><strong>{d.score}%</strong></td>
                                                <td style={{ color: '#ef4444', fontWeight: 600 }}>{d.variance}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>All departments are performing at or above the company average.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Section 4: Rating Distribution Curve */}
            <div className="report-card" style={{ marginBottom: '1.5rem' }}>
                <div className="report-card-header">
                    <h4 className="report-card-title">Rating Distribution (Bell Curve Consistency)</h4>
                </div>
                <div className="report-card-body">
                    {rating_distribution.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {rating_distribution.map((dist, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                                    <div style={{ width: '150px', textAlign: 'right', fontWeight: 500 }}>{dist.label}</div>
                                    <div style={{ flex: 1, background: '#f3f4f6', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            background: dist.color || '#9ca3af', 
                                            width: `${dist.percentage}%`, 
                                            height: '100%',
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                    <div style={{ width: '100px', fontWeight: 600 }}>
                                        {dist.count} ({dist.percentage}%)
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#6b7280', margin: 0 }}>No final rating distribution available for this cycle.</p>
                    )}
                </div>
            </div>

            {/* Section 5: Remediation Action Plan */}
            <div className="report-card" style={{ borderLeft: '6px solid #6366f1' }}>
                <div className="report-card-header" style={{ background: '#f5f3ff' }}>
                    <h4 className="report-card-title" style={{ color: '#4338ca' }}>💡 Strategic Remediation & Alignment Plan</h4>
                </div>
                <div className="report-card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* What to Add */}
                        <div>
                            <h5 style={{ color: '#065f46', fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px solid #10b981', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                🟢 WHAT TO ADD (Upskilling & Integration)
                            </h5>
                            {remediation_plan.what_to_add?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {remediation_plan.what_to_add.map((item, i) => (
                                        <div key={i} style={{ fontSize: '0.875rem' }}>
                                            <strong style={{ color: '#0f5132' }}>{item.topic}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.1rem 0' }}>Reason: {item.reason}</div>
                                            <p style={{ margin: 0, color: '#374151', lineHeight: 1.4 }}>Action: {item.action}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>No upskilling suggestions required.</p>
                            )}
                        </div>

                        {/* What to Remove/Address */}
                        <div>
                            <h5 style={{ color: '#991b1b', fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px solid #ef4444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                🔴 WHAT TO REMOVE / ADDRESS (Retention & Remediation)
                            </h5>
                            {remediation_plan.what_to_remove?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {remediation_plan.what_to_remove.map((item, i) => (
                                        <div key={i} style={{ fontSize: '0.875rem' }}>
                                            <strong style={{ color: '#842029' }}>{item.topic}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.1rem 0' }}>Reason: {item.reason}</div>
                                            <p style={{ margin: 0, color: '#374151', lineHeight: 1.4 }}>Action: {item.action}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>No talent attrition or performance issues identified.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationStrategicReport;
