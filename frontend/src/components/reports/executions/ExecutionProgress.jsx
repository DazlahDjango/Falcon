// frontend/src/components/reports/executions/ExecutionProgress.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiClock } from 'react-icons/fi';
import './executions.css';

export const ExecutionProgress = ({ execution }) => {
    const { status, started_at, duration, row_count, total_rows } = execution || {};

    const getProgress = () => {
        if (status === 'completed') return 100;
        if (status === 'failed') return 0;
        if (status === 'running') {
            if (total_rows && row_count !== undefined) {
                return Math.min(Math.round((row_count / total_rows) * 100), 99);
            }
            const elapsed = duration || Date.now() - new Date(started_at).getTime();
            return Math.min(Math.round((elapsed / 60000) * 20), 95);
        }
        return 0;
    };

    const getStatusMessage = () => {
        if (status === 'pending') return 'Waiting to start...';
        if (status === 'running') return 'Processing...';
        if (status === 'completed') return 'Completed successfully!';
        if (status === 'failed') return 'Failed';
        if (status === 'cancelled') return 'Cancelled';
        if (status === 'timeout') return 'Timeout';
        return 'Unknown';
    };

    const getElapsedTime = () => {
        if (!started_at) return '0s';
        const start = new Date(started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - start) / 1000);
        if (elapsed < 60) return `${elapsed}s`;
        if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const progress = getProgress();

    return (
        <div className="execution-progress-container">
            <div className="progress-header">
                <span className="progress-status">
                    <span className={`status-dot ${status}`} />
                    {getStatusMessage()}
                </span>
                {status === 'running' && (
                    <span className="progress-elapsed">
                        <FiClock size={14} />
                        {getElapsedTime()}
                    </span>
                )}
            </div>
            <div className="progress-bar-wrapper">
                <div
                    className={`progress-bar-fill ${status}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="progress-stats">
                {row_count !== undefined && (
                    <span className="stat-item">
                        <span className="stat-label">Processed:</span>
                        <span className="stat-value">{row_count.toLocaleString()}</span>
                    </span>
                )}
                {total_rows && (
                    <span className="stat-item">
                        <span className="stat-label">Total:</span>
                        <span className="stat-value">{total_rows.toLocaleString()}</span>
                    </span>
                )}
                {duration !== undefined && duration > 0 && (
                    <span className="stat-item">
                        <span className="stat-label">Duration:</span>
                        <span className="stat-value">
                            {duration < 60
                                ? `${duration.toFixed(1)}s`
                                : duration < 3600
                                    ? `${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`
                                    : `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`}
                        </span>
                    </span>
                )}
                {progress > 0 && progress < 100 && (
                    <span className="stat-item">
                        <span className="stat-label">Progress:</span>
                        <span className="stat-value">{progress}%</span>
                    </span>
                )}
            </div>
        </div>
    );
};

ExecutionProgress.propTypes = {
    execution: PropTypes.shape({
        status: PropTypes.string,
        started_at: PropTypes.string,
        duration: PropTypes.number,
        row_count: PropTypes.number,
        total_rows: PropTypes.number,
    }),
};