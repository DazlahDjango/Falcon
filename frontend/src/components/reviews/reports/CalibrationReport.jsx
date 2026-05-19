// src/components/reviews/reports/CalibrationReport.jsx
import React from 'react';
import './reports.css';
import ExportButton from './ExportButton';

const CalibrationReport = ({ report, sessionReport, loading, onExport }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return <div className="report-loading">Loading calibration report...</div>;
    }

    if (!report && !sessionReport) {
        return (
            <div className="report-empty">
                <p>No calibration report available.</p>
            </div>
        );
    }

    const data = report || sessionReport;

    return (
        <div className="report-container">
            <div className="report-header">
                <div>
                    <h2 className="report-title">Calibration Report</h2>
                    <p className="report-subtitle">
                        {data.session?.name || data.review_cycle?.name || 'Calibration Summary'}
                    </p>
                </div>
                <div className="report-actions">
                    <ExportButton onExport={onExport} />
                </div>
            </div>

            {/* Session Information */}
            {data.session && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Session Information</h3>
                    </div>
                    <div className="report-card-body">
                        <div className="summary-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{data.session.type}</div>
                                <div className="summary-stat-label">Type</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{formatDate(data.session.scheduled_date)}</div>
                                <div className="summary-stat-label">Scheduled</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{data.session.facilitator || '-'}</div>
                                <div className="summary-stat-label">Facilitator</div>
                            </div>
                        </div>
                        {data.session.decisions && (
                            <div className="report-section">
                                <div className="report-section-title">Decisions Made</div>
                                <p>{data.session.decisions}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Calibration Impact */}
            {data.calibration_impact && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Calibration Impact</h3>
                    </div>
                    <div className="report-card-body">
                        <div className="summary-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{data.calibration_impact.total_ratings_calibrated || 0}</div>
                                <div className="summary-stat-label">Ratings Calibrated</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">{data.calibration_impact.percentage_calibrated || 0}%</div>
                                <div className="summary-stat-label">of Total Ratings</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">
                                    {data.calibration_impact.average_before_score}% → {data.calibration_impact.average_after_score}%
                                </div>
                                <div className="summary-stat-label">Average Score Change</div>
                            </div>
                            <div className="summary-stat-card">
                                <div className="summary-stat-value">
                                    +{data.calibration_impact.increases || 0} / -{data.calibration_impact.decreases || 0}
                                </div>
                                <div className="summary-stat-label">Increases / Decreases</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Adjustments */}
            {data.adjustments && data.adjustments.list && data.adjustments.list.length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Rating Adjustments</h3>
                    </div>
                    <div className="report-card-body">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Before</th>
                                    <th>After</th>
                                    <th>Adjustment</th>
                                    <th>Reason</th>
                                    <th>Adjusted By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.adjustments.list.map((adj, index) => (
                                    <tr key={index}>
                                        <td>{adj.employee}</td>
                                        <td>{adj.before_score}%</td>
                                        <td className={adj.adjustment > 0 ? 'traffic-green' : adj.adjustment < 0 ? 'traffic-red' : ''}>
                                            {adj.after_score}%
                                        </td>
                                        <td className={adj.adjustment > 0 ? 'traffic-green' : adj.adjustment < 0 ? 'traffic-red' : ''}>
                                            {adj.adjustment > 0 ? `+${adj.adjustment}` : adj.adjustment}
                                        </td>
                                        <td>{adj.reason}</td>
                                        <td>{adj.adjusted_by}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Outlier Report */}
            {data.outliers && data.outliers.list && data.outliers.list.length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Outlier Ratings</h3>
                    </div>
                    <div className="report-card-body">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Score</th>
                                    <th>Reasons</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.outliers.list.map((outlier, index) => (
                                    <tr key={index}>
                                        <td>{outlier.employee}</td>
                                        <td>{outlier.department || '-'}</td>
                                        <td className={outlier.score < 60 ? 'traffic-red' : outlier.score > 90 ? 'traffic-green' : ''}>
                                            {outlier.score}%
                                        </td>
                                        <td>{outlier.reasons?.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Inconsistent Managers */}
            {data.inconsistent_managers && data.inconsistent_managers.list && data.inconsistent_managers.list.length > 0 && (
                <div className="report-card">
                    <div className="report-card-header">
                        <h3 className="report-card-title">Inconsistent Managers</h3>
                    </div>
                    <div className="report-card-body">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Manager</th>
                                    <th>Average Rating</th>
                                    <th>Department Average</th>
                                    <th>Deviation</th>
                                    <th>Employees</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.inconsistent_managers.list.map((manager, index) => (
                                    <tr key={index}>
                                        <td>{manager.manager}</td>
                                        <td>{manager.average_rating}%</td>
                                        <td>{manager.department_average || '-'}%</td>
                                        <td className={manager.deviation > 10 ? 'traffic-red' : manager.deviation < -10 ? 'traffic-red' : ''}>
                                            {manager.deviation > 0 ? `+${manager.deviation}` : manager.deviation}%
                                        </td>
                                        <td>{manager.employees_count}</td>
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

export default CalibrationReport;