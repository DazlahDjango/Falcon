// frontend/src/components/reports/exports/ExportTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { ExportStatusBadge } from './ExportStatusBadge';
import { ExportDownload } from './ExportDownload';
import './exports.css';

export const ExportTable = ({ exports = [], onView }) => {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const getFormatLabel = (format) => {
        const labels = {
            pdf: 'PDF',
            excel: 'Excel',
            csv: 'CSV',
            json: 'JSON',
            pptx: 'PowerPoint',
            html: 'HTML',
            xml: 'XML',
        };
        return labels[format] || format;
    };

    const getFormatIcon = (format) => {
        const icons = {
            pdf: '📄',
            excel: '📊',
            csv: '📋',
            json: '📝',
            pptx: '📑',
            html: '🌐',
            xml: '📄',
        };
        return icons[format] || '📄';
    };

    return (
        <div className="export-table-container">
            <table className="export-table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Format</th>
                        <th>Status</th>
                        <th>Size</th>
                        <th>Created</th>
                        <th>Downloads</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {exports.map((exportItem) => (
                        <tr key={exportItem.id}>
                            <td>
                                <div className="file-name-cell">
                                    <span className="format-icon">{getFormatIcon(exportItem.format)}</span>
                                    <span className="file-name">{exportItem.file_name || 'Untitled'}</span>
                                </div>
                            </td>
                            <td>
                                <span className="format-badge">{getFormatLabel(exportItem.format)}</span>
                            </td>
                            <td>
                                <ExportStatusBadge status={exportItem.status} size="small" />
                            </td>
                            <td>{formatFileSize(exportItem.file_size)}</td>
                            <td>{formatDate(exportItem.created_at)}</td>
                            <td>{exportItem.download_count || 0}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn view"
                                        onClick={() => onView?.(exportItem.id)}
                                        title="View Details"
                                    >
                                        <FiEye size={16} />
                                    </button>
                                    {exportItem.status === 'completed' && (
                                        <ExportDownload
                                            exportId={exportItem.id}
                                            filePath={exportItem.file_path}
                                            fileName={exportItem.file_name}
                                            variant="button"
                                            size="small"
                                        />
                                    )}
                                    {exportItem.status === 'failed' && (
                                        <button
                                            className="action-btn retry"
                                            onClick={() => onView?.(exportItem.id)}
                                            title="Retry Export"
                                        >
                                            <FiRefreshCw size={16} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

ExportTable.propTypes = {
    exports: PropTypes.array,
    onView: PropTypes.func,
};