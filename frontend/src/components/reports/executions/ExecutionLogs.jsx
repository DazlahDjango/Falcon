// frontend/src/components/reports/executions/ExecutionLogs.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { ReportLoading } from '../common';
import './executions.css';

export const ExecutionLogs = ({ logs = [], loading = false }) => {
    const [copied, setCopied] = useState(false);
    const [filterLevel, setFilterLevel] = useState('all');
    const logsContainerRef = useRef(null);

    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const getLevelColor = (level) => {
        const colors = {
            debug: '#94a3b8',
            info: '#3b82f6',
            warning: '#f59e0b',
            error: '#ef4444',
            critical: '#dc2626',
        };
        return colors[level] || '#94a3b8';
    };

    const getLevelLabel = (level) => {
        const labels = {
            debug: 'DEBUG',
            info: 'INFO',
            warning: 'WARN',
            error: 'ERROR',
            critical: 'CRITICAL',
        };
        return labels[level] || level.toUpperCase();
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3,
        });
    };

    const handleCopy = () => {
        const text = logs
            .filter((log) => filterLevel === 'all' || log.level === filterLevel)
            .map((log) => `[${formatTimestamp(log.timestamp)}] ${getLevelLabel(log.level)}: ${log.message}`)
            .join('\n');
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        const text = logs
            .filter((log) => filterLevel === 'all' || log.level === filterLevel)
            .map((log) => `[${log.timestamp || ''}] ${log.level}: ${log.message}`)
            .join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `execution_logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredLogs = filterLevel === 'all'
        ? logs
        : logs.filter((log) => log.level === filterLevel);

    if (loading) {
        return <ReportLoading variant="spinner" text="Loading logs..." />;
    }

    if (!logs.length) {
        return (
            <div className="execution-logs-empty">
                <span className="empty-icon">📋</span>
                <p>No logs available</p>
            </div>
        );
    }

    return (
        <div className="execution-logs-container">
            <div className="logs-toolbar">
                <div className="logs-filters">
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="level-filter"
                    >
                        <option value="all">All Levels</option>
                        <option value="debug">Debug</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="critical">Critical</option>
                    </select>
                    <span className="log-count">{filteredLogs.length} entries</span>
                </div>
                <div className="logs-actions">
                    <button className="action-btn copy" onClick={handleCopy} title="Copy logs">
                        {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                    </button>
                    <button className="action-btn download" onClick={handleDownload} title="Download logs">
                        <FiDownload size={14} />
                    </button>
                </div>
            </div>
            <div className="logs-content" ref={logsContainerRef}>
                {filteredLogs.map((log, index) => (
                    <div key={index} className="log-entry">
                        <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                        <span
                            className="log-level"
                            style={{ color: getLevelColor(log.level) }}
                        >
                            {getLevelLabel(log.level)}
                        </span>
                        <span className="log-message">{log.message}</span>
                        {log.data && (
                            <pre className="log-data">{JSON.stringify(log.data, null, 2)}</pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

ExecutionLogs.propTypes = {
    logs: PropTypes.array,
    loading: PropTypes.bool,
};