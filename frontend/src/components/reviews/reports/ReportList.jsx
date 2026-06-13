// src/components/reviews/reports/ReportList.jsx
import React from 'react';
import './reports.css';

const ReportList = ({ reports = [], onDownload, onDelete, onView, loading = false }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed': return 'status-completed';
            case 'processing': return 'status-processing';
            case 'pending': return 'status-pending';
            case 'failed': return 'status-failed';
            default: return 'status-pending';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Ready';
            case 'processing': return 'Processing';
            case 'pending': return 'Pending';
            case 'failed': return 'Failed';
            default: return 'Pending';
        }
    };

    if (loading) {
        return <div className="report-loading">Loading reports...</div>;
    }

    if (!reports || reports.length === 0) {
        return (
            <div className="report-empty">
                <p>No reports generated yet.</p>
                <p>Use the form above to generate your first report.</p>
            </div>
        );
    }

    return (
        <div className="report-card">
            <div className="report-card-header">
                <h3 className="report-card-title">My Reports</h3>
            </div>
            <div className="report-card-body">
                <div style={{ overflowX: 'auto' }}>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Report Name</th>
                                <th>Type</th>
                                <th>Generated</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report.id}>
                                    <td>{report.name || `Report ${report.id}`}</td>
                                    <td>{report.report_type || 'N/A'}</td>
                                    <td>{formatDate(report.created_at)}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(report.status)}`}>
                                            {getStatusLabel(report.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {report.status === 'completed' && onView && (
                                                <button
                                                    className="action-btn"
                                                    onClick={() => onView(report)}
                                                    title="View"
                                                >
                                                    👁️
                                                </button>
                                            )}
                                            {report.status === 'completed' && onDownload && (
                                                <button
                                                    className="action-btn"
                                                    onClick={() => onDownload(report)}
                                                    title="Download"
                                                >
                                                    📥
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    className="action-btn"
                                                    onClick={() => onDelete(report.id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportList;