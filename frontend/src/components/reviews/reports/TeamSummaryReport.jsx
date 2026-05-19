// src/components/reviews/reports/TeamSummaryReport.jsx
import React from 'react';
import './reports.css';
import ExportButton from './ExportButton';

const TeamSummaryReport = ({ summary, loading, onExport }) => {
    const getTrafficLightClass = (score) => {
        if (score >= 80) return 'traffic-green';
        if (score >= 60) return 'traffic-yellow';
        return 'traffic-red';
    };

    if (loading) {
        return <div className="report-loading">Loading team report...</div>;
    }

    if (!summary) {
        return (
            <div className="report-empty">
                <p>No team summary available.</p>
            </div>
        );
    }

    return (
        <div className="report-container">
            <div className="report-header">
                <div>
                    <h2 className="report-title">Team Summary Report</h2>
                    <p className="report-subtitle">
                        {summary.manager?.name} - {summary.review_cycle?.name}
                    </p>
                </div>
                <div className="report-actions">
                    <ExportButton onExport={onExport} />
                </div>
            </div>

            {/* Team Stats */}
            <div className="summary-stats">
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.total_employees}</div>
                    <div className="summary-stat-label">Team Members</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.aggregate_stats?.promotion_recommendations || 0}</div>
                    <div className="summary-stat-label">Promotions</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.aggregate_stats?.pip_recommendations || 0}</div>
                    <div className="summary-stat-label">PIPs</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.aggregate_stats?.avg_final_score || '-'}%</div>
                    <div className="summary-stat-label">Team Average</div>
                </div>
            </div>

            {/* Rating Distribution */}
            {summary.aggregate_stats?.ratings_distribution && Object.keys(summary.aggregate_stats.ratings_distribution).length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Rating Distribution</h3>
                    </div>
                    <div className="report-card-body">
                        {Object.entries(summary.aggregate_stats.ratings_distribution).map(([rating, count]) => (
                            <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <span style={{ width: '150px' }}>{rating}</span>
                                <div style={{ flex: 1, height: '1.5rem', background: '#e5e7eb', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                    <div style={{ width: `${(count / summary.total_employees) * 100}%`, height: '100%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', color: 'white', fontSize: '0.75rem' }}>
                                        {(count / summary.total_employees) * 100 > 15 ? `${Math.round((count / summary.total_employees) * 100)}%` : ''}
                                    </div>
                                </div>
                                <span style={{ width: '60px' }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team Members Table */}
            <div className="report-card">
                <div className="report-card-header">
                    <h3 className="report-card-title">Team Members</h3>
                </div>
                <div className="report-card-body">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Position</th>
                                <th>Final Score</th>
                                <th>Rating</th>
                                <th>Promotion</th>
                                <th>PIP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.employees?.map((employee, index) => (
                                <tr key={index}>
                                    <td>{employee.employee?.name || employee.employee_name}</td>
                                    <td>{employee.employee?.position || '-'}</td>
                                    <td className={getTrafficLightClass(employee.final_rating?.final_score)}>
                                        {employee.final_rating?.final_score || '-'}%
                                    </td>
                                    <td>{employee.final_rating?.final_rating_label || 'Not Rated'}</td>
                                    <td>{employee.final_rating?.promotion_recommended ? '✓' : '-'}</td>
                                    <td>{employee.final_rating?.pip_recommended ? '⚠️' : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamSummaryReport;