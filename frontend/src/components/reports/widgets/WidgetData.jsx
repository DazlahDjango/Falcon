// frontend/src/components/reports/widgets/WidgetData.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiRefreshCw, FiDownload, FiCopy } from 'react-icons/fi';
import { ReportLoading, ReportError } from '../common';
import './widgets.css';

export const WidgetData = ({
    widgetId,
    data,
    loading,
    error,
    onRefresh,
    onExport,
    className = '',
}) => {
    const [viewMode, setViewMode] = useState('table');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopy = () => {
        const jsonData = JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(jsonData).then(() => {
            setCopied(true);
        });
    };

    const renderTableData = () => {
        if (!data) return null;

        // If data is an array, render as table
        if (Array.isArray(data) && data.length > 0) {
            const columns = Object.keys(data[0]);
            return (
                <div className="widget-data-table-wrapper">
                    <table className="widget-data-table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 100).map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map((col) => (
                                        <td key={col}>
                                            {row[col] !== undefined && row[col] !== null
                                                ? typeof row[col] === 'object'
                                                    ? JSON.stringify(row[col])
                                                    : String(row[col])
                                                : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.length > 100 && (
                        <div className="data-limit-note">
                            Showing first 100 of {data.length} rows
                        </div>
                    )}
                </div>
            );
        }

        // If data is an object, render as JSON
        return (
            <pre className="widget-data-json">
                {JSON.stringify(data, null, 2)}
            </pre>
        );
    };

    if (loading) {
        return <ReportLoading variant="spinner" text="Loading data..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={onRefresh}
                title="Failed to load widget data"
            />
        );
    }

    if (!data) {
        return (
            <div className="widget-data-empty">
                <p>No data available</p>
            </div>
        );
    }

    return (
        <div className={`widget-data-container ${className}`}>
            <div className="widget-data-header">
                <div className="data-controls">
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            Table
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
                            onClick={() => setViewMode('json')}
                        >
                            JSON
                        </button>
                    </div>
                </div>
                <div className="data-actions">
                    <button className="action-btn" onClick={onRefresh} title="Refresh">
                        <FiRefreshCw size={16} />
                    </button>
                    <button className="action-btn" onClick={onExport} title="Export">
                        <FiDownload size={16} />
                    </button>
                    <button className="action-btn" onClick={handleCopy} title="Copy">
                        <FiCopy size={16} />
                        {copied && <span className="copied-badge">Copied!</span>}
                    </button>
                </div>
            </div>

            <div className="widget-data-body">
                {viewMode === 'table' ? renderTableData() : (
                    <pre className="widget-data-json">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )}
            </div>

            <div className="widget-data-footer">
                <span className="data-meta">
                    {Array.isArray(data) ? `${data.length} items` : 'Object data'}
                </span>
                <span className="data-meta">
                    Updated: {new Date().toLocaleString()}
                </span>
            </div>
        </div>
    );
};

WidgetData.propTypes = {
    widgetId: PropTypes.string,
    data: PropTypes.any,
    loading: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onRefresh: PropTypes.func,
    onExport: PropTypes.func,
    className: PropTypes.string,
};