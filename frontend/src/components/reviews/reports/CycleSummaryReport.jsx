// src/components/reviews/reports/CycleSummaryReport.jsx
import React from 'react';
import './reports.css';
import ExportButton from './ExportButton';

const CycleSummaryReport = ({ summary, loading, onExport }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <div className="report-loading">Loading cycle report...</div>;
    }

    if (!summary) {
        return (
            <div className="report-empty">
                <p>No cycle summary available.</p>
            </div>
        );
    }

    return (
        <div className="report-container">
            <div className="report-header">
                <div>
                    <h2 className="report-title">Cycle Summary Report</h2>
                    <p className="report-subtitle">
                        {summary.cycle_name} ({formatDate(summary.period?.start)} - {formatDate(summary.period?.end)})
                    </p>
                </div>
                <div className="report-actions">
                    <ExportButton onExport={onExport} />
                </div>
            </div>

            <div className="summary-stats">
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.total_employees}</div>
                    <div className="summary-stat-label">Total Employees</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.total_ratings}</div>
                    <div className="summary-stat-label">Ratings Completed</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.average_score || '-'}%</div>
                    <div className="summary-stat-label">Average Score</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.promotions || 0}</div>
                    <div className="summary-stat-label">Promotions</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{summary.pips || 0}</div>
                    <div className="summary-stat-label">PIPs</div>
                </div>
            </div>

            {summary.score_distribution && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Score Distribution</h3>
                    </div>
                    <div className="report-card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <div>Min Score: <strong>{summary.min_score || '-'}%</strong></div>
                                <div>Max Score: <strong>{summary.max_score || '-'}%</strong></div>
                            </div>
                            <div>
                                <div>Median: <strong>{summary.median_score || '-'}%</strong></div>
                                <div>Std Dev: <strong>{summary.std_dev || '-'}</strong></div>
                            </div>
                        </div>
                        <div style={{ height: '200px', background: '#f9fafb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Chart would be integrated here */}
                            <span style={{ color: '#9ca3af' }}>Distribution chart visualization</span>
                        </div>
                    </div>
                </div>
            )}

            {summary.department_breakdown && summary.department_breakdown.length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Department Breakdown</h3>
                    </div>
                    <div className="report-card-body">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Employees</th>
                                    <th>Average Score</th>
                                    <th>Promotions</th>
                                    <th>PIPs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.department_breakdown.map((dept, index) => (
                                    <tr key={index}>
                                        <td>{dept.name}</td>
                                        <td>{dept.employee_count}</td>
                                        <td>{dept.avg_score || '-'}%</td>
                                        <td>{dept.promotions || 0}</td>
                                        <td>{dept.pips || 0}</td>
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

export default CycleSummaryReport;