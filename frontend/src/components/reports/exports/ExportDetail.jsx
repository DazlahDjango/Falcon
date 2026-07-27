// frontend/src/components/reports/exports/ExportDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiDownload,
    FiRefreshCw,
    FiTrash2,
    FiClock,
    FiUser,
    FiFile,
    FiDatabase,
} from 'react-icons/fi';
import { useExport } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { ExportStatusBadge } from './ExportStatusBadge';
import { ExportDownload } from './ExportDownload';
import './exports.css';

export const ExportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        exportItem,
        loading,
        error,
        fetchOne,
        remove,
        regenerate,
        clearErrors,
    } = useExport(id, { autoFetch: true });

    const handleBack = () => {
        navigate('/reports/exports');
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await remove(id);
        navigate('/reports/exports');
    };

    const handleRegenerate = async () => {
        await regenerate(id);
        await fetchOne(id);
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

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading export..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load export"
            />
        );
    }

    if (!exportItem) {
        return <ReportError error="Export not found" title="Export not found" />;
    }

    return (
        <div className="export-detail-container">
            <div className="export-detail-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Exports
                </button>
                <h1 className="page-title">Export Details</h1>
                <ExportStatusBadge status={exportItem.status} size="large" />
            </div>

            <div className="export-detail-grid">
                <div className="detail-main">
                    <div className="detail-section">
                        <h3>Export Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">
                                    <FiFile size={14} />
                                    File Name
                                </span>
                                <span className="info-value">{exportItem.file_name || 'Untitled'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Format</span>
                                <span className="info-value">{getFormatLabel(exportItem.format)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiDatabase size={14} />
                                    File Size
                                </span>
                                <span className="info-value">{formatFileSize(exportItem.file_size)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Pages</span>
                                <span className="info-value">{exportItem.page_count || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">MIME Type</span>
                                <span className="info-value">{exportItem.mime_type || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Compressed</span>
                                <span className="info-value">{exportItem.is_compressed ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Encrypted</span>
                                <span className="info-value">{exportItem.is_encrypted ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Password Protected</span>
                                <span className="info-value">{exportItem.password_protected ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>

                    {exportItem.watermark_text && (
                        <div className="detail-section">
                            <h3>Watermark</h3>
                            <p className="watermark-text">{exportItem.watermark_text}</p>
                        </div>
                    )}

                    {exportItem.export_config && Object.keys(exportItem.export_config).length > 0 && (
                        <div className="detail-section">
                            <h3>Export Configuration</h3>
                            <pre className="config-json">
                                {JSON.stringify(exportItem.export_config, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="detail-sidebar">
                    <div className="detail-section actions-section">
                        <h3>Actions</h3>
                        <div className="action-buttons-vertical">
                            {exportItem.status === 'completed' && (
                                <ExportDownload
                                    exportId={exportItem.id}
                                    filePath={exportItem.file_path}
                                    fileName={exportItem.file_name}
                                    variant="full"
                                    className="download-btn-full"
                                />
                            )}
                            <button
                                className="btn btn-secondary full-width"
                                onClick={handleRegenerate}
                                disabled={exportItem.status === 'processing'}
                            >
                                <FiRefreshCw size={16} />
                                {exportItem.status === 'processing' ? 'Processing...' : 'Regenerate'}
                            </button>
                            <button
                                className="btn btn-danger full-width"
                                onClick={handleDelete}
                            >
                                <FiTrash2 size={16} />
                                Delete Export
                            </button>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Metadata</h3>
                        <div className="info-grid single">
                            <div className="info-item">
                                <span className="info-label">Status</span>
                                <span className="info-value">
                                    <ExportStatusBadge status={exportItem.status} size="small" />
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiUser size={14} />
                                    Exported By
                                </span>
                                <span className="info-value">
                                    {exportItem.exported_by?.name || exportItem.exported_by?.email || 'Unknown'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock size={14} />
                                    Created
                                </span>
                                <span className="info-value">{formatDate(exportItem.created_at)}</span>
                            </div>
                            {exportItem.delivered_at && (
                                <div className="info-item">
                                    <span className="info-label">Delivered</span>
                                    <span className="info-value">{formatDate(exportItem.delivered_at)}</span>
                                </div>
                            )}
                            {exportItem.expires_at && (
                                <div className="info-item">
                                    <span className="info-label">Expires</span>
                                    <span className="info-value">{formatDate(exportItem.expires_at)}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">Downloads</span>
                                <span className="info-value">{exportItem.download_count || 0}</span>
                            </div>
                            {exportItem.last_downloaded_at && (
                                <div className="info-item">
                                    <span className="info-label">Last Downloaded</span>
                                    <span className="info-value">{formatDate(exportItem.last_downloaded_at)}</span>
                                </div>
                            )}
                            {exportItem.delivered_via && (
                                <div className="info-item">
                                    <span className="info-label">Delivered Via</span>
                                    <span className="info-value">{exportItem.delivered_via}</span>
                                </div>
                            )}
                            {exportItem.department && (
                                <div className="info-item">
                                    <span className="info-label">Department</span>
                                    <span className="info-value">{exportItem.department}</span>
                                </div>
                            )}
                            {exportItem.team && (
                                <div className="info-item">
                                    <span className="info-label">Team</span>
                                    <span className="info-value">{exportItem.team}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Export"
                message={`Are you sure you want to delete this export? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};