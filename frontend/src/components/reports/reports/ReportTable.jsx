// frontend/src/components/reports/reports/ReportTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEdit2, FiTrash2, FiPlay, FiDownload, FiClock } from 'react-icons/fi';
import { ReportStatusBadge } from '../common';
import './reports.css';

export const ReportTable = ({
    reports = [],
    onView,
    onEdit,
    onDelete,
    onGenerate,
    onExport,
}) => {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTypeLabel = (type) => {
        const labels = {
            kpi: 'KPI',
            departmental: 'Dept.',
            executive: 'Executive',
            compliance: 'Compliance',
            trend: 'Trend',
            comparative: 'Comparative',
            mission: 'Mission',
            pip: 'PIP',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

    return (
        <div className="report-table-container">
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Last Generated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id}>
                            <td>
                                <div className="report-name-cell">
                                    <span className="report-name">{report.name}</span>
                                    {report.is_published && (
                                        <span className="published-badge">Published</span>
                                    )}
                                    {report.is_archived && (
                                        <span className="archived-badge">Archived</span>
                                    )}
                                </div>
                            </td>
                            <td>
                                <span className="report-type-badge">{getTypeLabel(report.report_type)}</span>
                            </td>
                            <td>
                                <ReportStatusBadge status={report.status} size="small" />
                            </td>
                            <td>{formatDate(report.last_generated_at)}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn view"
                                        onClick={() => onView?.(report.id)}
                                        title="View Report"
                                    >
                                        <FiEye size={16} />
                                    </button>
                                    <button
                                        className="action-btn generate"
                                        onClick={() => onGenerate?.(report.id)}
                                        title="Generate Report"
                                    >
                                        <FiPlay size={16} />
                                    </button>
                                    <button
                                        className="action-btn export"
                                        onClick={() => onExport?.(report.id)}
                                        title="Export Report"
                                    >
                                        <FiDownload size={16} />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        onClick={() => onEdit?.(report.id)}
                                        title="Edit Report"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => onDelete?.(report)}
                                        title="Delete Report"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

ReportTable.propTypes = {
    reports: PropTypes.array,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onGenerate: PropTypes.func,
    onExport: PropTypes.func,
};