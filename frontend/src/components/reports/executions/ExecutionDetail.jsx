// frontend/src/components/reports/executions/ExecutionDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiUser, FiDatabase, FiFileText } from 'react-icons/fi';
import { useExecution } from '../../../hooks/reports';
import { ReportLoading, ReportError } from '../common';
import { ExecutionStatusBadge } from './ExecutionStatusBadge';
import { ExecutionLogs } from './ExecutionLogs';
import { ExecutionProgress } from './ExecutionProgress';
import './executions.css';

export const ExecutionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        execution,
        logs,
        loading,
        error,
        fetchOne,
        fetchLogs,
        clearErrors,
    } = useExecution(id, { autoFetch: true });

    const [showLogs, setShowLogs] = useState(true);

    useEffect(() => {
        if (execution) {
            fetchLogs(id);
        }
    }, [execution, id, fetchLogs]);

    const handleBack = () => {
        navigate('/reports/executions');
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

    const getReportName = () => {
        return execution?.report_name || execution?.report || 'Unknown';
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading execution..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load execution"
            />
        );
    }

    if (!execution) {
        return <ReportError error="Execution not found" title="Execution not found" />;
    }

    const isRunning = execution.status === 'running';

    return (
        <div className="execution-detail-container">
            <div className="execution-detail-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Executions
                </button>
                <h1 className="page-title">Execution Details</h1>
                <ExecutionStatusBadge status={execution.status} size="large" />
            </div>

            <div className="execution-detail-grid">
                <div className="detail-main">
                    <div className="detail-section">
                        <h3>Execution Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Execution ID</span>
                                <span className="info-value code">{execution.id}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Report</span>
                                <span className="info-value">{getReportName()}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock size={14} />
                                    Started
                                </span>
                                <span className="info-value">{formatDate(execution.started_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock size={14} />
                                    Completed
                                </span>
                                <span className="info-value">{formatDate(execution.completed_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Duration</span>
                                <span className="info-value">{formatDuration(execution.duration)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiUser size={14} />
                                    Triggered By
                                </span>
                                <span className="info-value">{execution.triggered_by_name || 'System'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiDatabase size={14} />
                                    Rows Processed
                                </span>
                                <span className="info-value">{execution.row_count || 0}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Retry Count</span>
                                <span className="info-value">{execution.retry_count || 0}</span>
                            </div>
                        </div>
                    </div>

                    {execution.result_summary && (
                        <div className="detail-section">
                            <h3>Result Summary</h3>
                            <p className="result-summary">{execution.result_summary}</p>
                        </div>
                    )}

                    {execution.error_message && (
                        <div className="detail-section error-section">
                            <h3>Error Details</h3>
                            <div className="error-container">
                                <p className="error-message">{execution.error_message}</p>
                                {execution.error_traceback && (
                                    <pre className="error-traceback">{execution.error_traceback}</pre>
                                )}
                            </div>
                        </div>
                    )}

                    {execution.parameters_used && Object.keys(execution.parameters_used).length > 0 && (
                        <div className="detail-section">
                            <h3>Parameters Used</h3>
                            <pre className="params-json">
                                {JSON.stringify(execution.parameters_used, null, 2)}
                            </pre>
                        </div>
                    )}

                    {execution.filters_used && Object.keys(execution.filters_used).length > 0 && (
                        <div className="detail-section">
                            <h3>Filters Used</h3>
                            <pre className="params-json">
                                {JSON.stringify(execution.filters_used, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="detail-sidebar">
                    {isRunning && (
                        <div className="detail-section">
                            <h3>Progress</h3>
                            <ExecutionProgress execution={execution} />
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>
                            <FiFileText size={14} />
                            Execution Logs
                        </h3>
                        <button
                            className="btn btn-outline btn-sm toggle-logs"
                            onClick={() => setShowLogs(!showLogs)}
                        >
                            {showLogs ? 'Hide Logs' : 'Show Logs'}
                        </button>
                        {showLogs && <ExecutionLogs logs={logs} loading={loading} />}
                    </div>

                    <div className="detail-section">
                        <h3>Metadata</h3>
                        <div className="info-grid single">
                            <div className="info-item">
                                <span className="info-label">Status</span>
                                <span className="info-value">
                                    <ExecutionStatusBadge status={execution.status} size="small" />
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Created</span>
                                <span className="info-value">{formatDate(execution.created_at)}</span>
                            </div>
                            {execution.schedule && (
                                <div className="info-item">
                                    <span className="info-label">Schedule</span>
                                    <span className="info-value">{execution.schedule_name || execution.schedule}</span>
                                </div>
                            )}
                            {execution.data_size > 0 && (
                                <div className="info-item">
                                    <span className="info-label">Data Size</span>
                                    <span className="info-value">
                                        {execution.data_size > 1024 * 1024
                                            ? `${(execution.data_size / (1024 * 1024)).toFixed(2)} MB`
                                            : execution.data_size > 1024
                                                ? `${(execution.data_size / 1024).toFixed(2)} KB`
                                                : `${execution.data_size} B`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};