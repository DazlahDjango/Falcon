// frontend/src/components/reports/executions/ExecutionTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiClock, FiUser } from 'react-icons/fi';
import { ExecutionStatusBadge } from './ExecutionStatusBadge';
import './executions.css';

export const ExecutionTable = ({ executions = [], onView }) => {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const getReportName = (execution) => {
        return execution.report_name || execution.report || 'Unknown';
    };

    return (
        <div className="execution-table-container">
            <table className="execution-table">
                <thead>
                    <tr>
                        <th>Report</th>
                        <th>Status</th>
                        <th>Started</th>
                        <th>Duration</th>
                        <th>Rows</th>
                        <th>Triggered By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {executions.map((execution) => (
                        <tr key={execution.id}>
                            <td>
                                <span className="report-name">{getReportName(execution)}</span>
                            </td>
                            <td>
                                <ExecutionStatusBadge status={execution.status} size="small" />
                            </td>
                            <td>{formatDate(execution.started_at)}</td>
                            <td>{formatDuration(execution.duration)}</td>
                            <td>{execution.row_count || 0}</td>
                            <td>
                                <span className="triggered-by">
                                    <FiUser size={12} />
                                    {execution.triggered_by_name || 'System'}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="action-btn view"
                                    onClick={() => onView?.(execution.id)}
                                    title="View Execution"
                                >
                                    <FiEye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

ExecutionTable.propTypes = {
    executions: PropTypes.array,
    onView: PropTypes.func,
};