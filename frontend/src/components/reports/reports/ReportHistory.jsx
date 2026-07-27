// frontend/src/components/reports/reports/ReportHistory.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiClock, FiUser, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { useExecutions } from '../../../hooks/reports';
import { ReportLoading, ReportError } from '../common';
import './reports.css';

export const ReportHistory = ({ reportId, limit = 20 }) => {
    const {
        executions,
        loading,
        error,
        fetchByReport,
        clearErrors,
    } = useExecutions({ autoFetch: false });

    const [expandedExecution, setExpandedExecution] = useState(null);

    useEffect(() => {
        if (reportId) {
            fetchByReport(reportId);
        }
    }, [reportId, fetchByReport]);

    const getStatusIcon = (status) => {
        const icons = {
            pending: <FiClock size={14} />,
            running: <FiLoader size={14} className="spinning" />,
            completed: <FiCheckCircle size={14} />,
            failed: <FiXCircle size={14} />,
            cancelled: <FiXCircle size={14} />,
            timeout: <FiClock size={14} />,
        };
        return icons[status] || <FiClock size={14} />;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#94a3b8',
            running: '#3b82f6',
            completed: '#10b981',
            failed: '#ef4444',
            cancelled: '#64748b',
            timeout: '#f59e0b',
        };
        return colors[status] || '#94a3b8';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            running: 'Running',
            completed: 'Completed',
            failed: 'Failed',
            cancelled: 'Cancelled',
            timeout: 'Timeout',
        };
        return labels[status] || status;
    };

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

    const toggleExecution = (id) => {
        setExpandedExecution(expandedExecution === id ? null : id);
    };

    if (loading && !executions.length) {
        return <ReportLoading variant="spinner" text="Loading history..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchByReport(reportId);
                }}
                title="Failed to load history"
            />
        );
    }

    if (!executions.length) {
        return (
            <div className="report-history-empty">
                <span className="empty-icon">📋</span>
                <p>No execution history available</p>
            </div>
        );
    }

    return (
        <div className="report-history-container">
            <div className="history-header">
                <h3>Execution History</h3>
                <span className="history-count">{executions.length} executions</span>
            </div>
            <div className="history-list">
                {executions.slice(0, limit).map((execution) => (
                    <div
                        key={execution.id}
                        className={`history-item ${expandedExecution === execution.id ? 'expanded' : ''}`}
                    >
                        <div className="history-item-header" onClick={() => toggleExecution(execution.id)}>
                            <div className="item-left">
                                <span
                                    className="status-icon"
                                    style={{ color: getStatusColor(execution.status) }}
                                >
                                    {getStatusIcon(execution.status)}
                                </span>
                                <span className="status-label">{getStatusLabel(execution.status)}</span>
                            </div>
                            <div className="item-right">
                                <span className="item-date">{formatDate(execution.started_at)}</span>
                                <span className="item-duration">
                                    <FiClock size={12} />
                                    {formatDuration(execution.duration)}
                                </span>
                                {execution.triggered_by && (
                                    <span className="item-user">
                                        <FiUser size={12} />
                                        {execution.triggered_by_name || 'System'}
                                    </span>
                                )}
                            </div>
                        </div>
                        {expandedExecution === execution.id && (
                            <div className="history-item-details">
                                {execution.row_count !== undefined && (
                                    <div className="detail-row">
                                        <span className="detail-label">Rows Processed:</span>
                                        <span className="detail-value">{execution.row_count}</span>
                                    </div>
                                )}
                                {execution.result_summary && (
                                    <div className="detail-row">
                                        <span className="detail-label">Summary:</span>
                                        <span className="detail-value">{execution.result_summary}</span>
                                    </div>
                                )}
                                {execution.error_message && (
                                    <div className="detail-row error">
                                        <span className="detail-label">Error:</span>
                                        <span className="detail-value">{execution.error_message}</span>
                                    </div>
                                )}
                                {execution.execution_log && execution.execution_log.length > 0 && (
                                    <div className="detail-row logs">
                                        <span className="detail-label">Logs:</span>
                                        <div className="logs-container">
                                            {execution.execution_log.slice(-5).map((log, idx) => (
                                                <div key={idx} className="log-entry">
                                                    <span className="log-time">{log.timestamp || ''}</span>
                                                    <span className={`log-level ${log.level}`}>{log.level}</span>
                                                    <span className="log-message">{log.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {executions.length > limit && (
                <div className="history-more">
                    <span>Showing {limit} of {executions.length} executions</span>
                </div>
            )}
        </div>
    );
};

ReportHistory.propTypes = {
    reportId: PropTypes.string.isRequired,
    limit: PropTypes.number,
};