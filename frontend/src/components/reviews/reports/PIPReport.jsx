// src/components/reviews/reports/PIPReport.jsx
import React from 'react';
import './reports.css';
import ExportButton from './ExportButton';

const PIPReport = ({ report, loading, onExport }) => {
    if (loading) {
        return <div className="report-loading">Loading PIP report...</div>;
    }

    if (!report) {
        return (
            <div className="report-empty">
                <p>No PIP report available.</p>
            </div>
        );
    }

    return (
        <div className="report-container">
            <div className="report-header">
                <div>
                    <h2 className="report-title">Performance Improvement Plans Report</h2>
                    <p className="report-subtitle">Organization-wide PIP summary</p>
                </div>
                <div className="report-actions">
                    <ExportButton onExport={onExport} />
                </div>
            </div>

            <div className="summary-stats">
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{report.total_pips}</div>
                    <div className="summary-stat-label">Total PIPs</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{report.active_pips}</div>
                    <div className="summary-stat-label">Active</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{report.overdue_pips}</div>
                    <div className="summary-stat-label">Overdue</div>
                </div>
                <div className="summary-stat-card">
                    <div className="summary-stat-value">{report.success_rate || 0}%</div>
                    <div className="summary-stat-label">Success Rate</div>
                </div>
            </div>

            {/* Severity Breakdown */}
            {report.by_severity && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">PIP Severity Breakdown</h3>
                    </div>
                    <div className="report-card-body">
                        <div className="summary-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_severity.minor || 0}</div>
                                <div className="summary-stat-label">Minor</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_severity.moderate || 0}</div>
                                <div className="summary-stat-label">Moderate</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_severity.severe || 0}</div>
                                <div className="summary-stat-label">Severe</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_severity.critical || 0}</div>
                                <div className="summary-stat-label">Critical</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Department Breakdown */}
            {report.by_department && Object.keys(report.by_department).length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">PIPs by Department</h3>
                    </div>
                    <div className="report-card-body">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>PIP Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(report.by_department).map(([dept, count], index) => (
                                    <tr key={index}>
                                        <td>{dept}</td>
                                        <td>{count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Outcome Breakdown */}
            {report.by_outcome && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">PIP Outcomes</h3>
                    </div>
                    <div className="report-card-body">
                        <div className="summary-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_outcome.successful || 0}</div>
                                <div className="summary-stat-label">Successful</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_outcome.extended || 0}</div>
                                <div className="summary-stat-label">Extended</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_outcome.failed || 0}</div>
                                <div className="summary-stat-label">Failed</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_outcome.terminated || 0}</div>
                                <div className="summary-stat-label">Terminated</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{report.by_outcome.resigned || 0}</div>
                                <div className="summary-stat-label">Resigned</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active PIP List */}
            {report.active_pip_details && report.active_pip_details.length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Active PIPs</h3>
                    </div>
                    <div className="report-card-body">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Title</th>
                                    <th>Severity</th>
                                    <th>Days Remaining</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.active_pip_details.map((pip, index) => (
                                    <tr key={index}>
                                        <td>{pip.employee}</td>
                                        <td>{pip.title}</td>
                                        <td>{pip.severity}</td>
                                        <td className={pip.days_remaining < 7 ? 'traffic-red' : ''}>
                                            {pip.days_remaining || 0} days
                                        </td>
                                        <td>{pip.completion_percentage || 0}%</td>
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

export default PIPReport;