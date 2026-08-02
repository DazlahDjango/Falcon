// frontend/src/components/reports/reports/ReportDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiPlay,
    FiDownload,
    FiRefreshCw,
    FiClock,
    FiUser,
    FiTag,
    FiCalendar,
} from 'react-icons/fi';
import { useReport } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportStatusBadge, ReportConfirmDialog } from '../common';
import { REPORT_TYPE_LABELS } from '../../../config/constants/reportConstants';
import { ReportHistory } from './ReportHistory';
import './reports.css';

export const ReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();

    const {
        report,
        loading,
        error,
        fetchOne,
        remove,
        generate,
        updateStatus,
        clearErrors,
    } = useReport(id, { autoFetch: true });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const handleBack = () => {
        navigate('/reports');
    };

    const handleEdit = () => {
        navigate(`/reports/${id}/edit`);
    };

    const handleGenerate = async () => {
        await generate(id);
        await fetchOne(id);
    };

    const handleExport = () => {
        navigate(`/reports/${id}/export`);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await remove(id);
        navigate('/reports');
    };

    const handleStatusChange = async () => {
        if (newStatus) {
            await updateStatus(id, newStatus);
            await fetchOne(id);
            setShowStatusModal(false);
            setNewStatus('');
        }
    };

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

    const getTypeLabel = (type) => REPORT_TYPE_LABELS[type] || type;

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading report..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load report"
            />
        );
    }

    if (!report) {
        return <ReportError error="Report not found" title="Report not found" />;
    }

    return (
        <div className="report-detail-container">
            <div className="report-detail-header">
                <div className="header-left">
                    <button className="btn btn-outline back-btn" onClick={handleBack}>
                        <FiArrowLeft size={18} />
                        Back to Reports
                    </button>
                    <h1 className="report-title">{report.name}</h1>
                    <ReportStatusBadge status={report.status} />
                </div>
                <div className="header-right">
                    {permissions.canGenerateReport && (
                        <button
                            className="btn btn-primary"
                            onClick={handleGenerate}
                            disabled={report.status === 'generating'}
                        >
                            <FiPlay size={16} />
                            {report.status === 'generating' ? 'Generating...' : 'Generate'}
                        </button>
                    )}
                    {permissions.canExportReport && (
                        <button className="btn btn-secondary" onClick={handleExport}>
                            <FiDownload size={16} />
                            Export
                        </button>
                    )}
                    {permissions.canUpdateReport && (
                        <button className="btn btn-secondary" onClick={handleEdit}>
                            <FiEdit2 size={16} />
                            Edit
                        </button>
                    )}
                    {permissions.canDeleteReport && (
                        <button className="btn btn-danger" onClick={handleDelete}>
                            <FiTrash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="report-detail-grid">
                <div className="detail-main">
                    <div className="detail-section">
                        <h3>Report Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Type</span>
                                <span className="info-value">{getTypeLabel(report.report_type)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Category</span>
                                <span className="info-value">{report.category || 'Uncategorized'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Status</span>
                                <span className="info-value">
                                    <ReportStatusBadge status={report.status} />
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Published</span>
                                <span className="info-value">{report.is_published ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Archived</span>
                                <span className="info-value">{report.is_archived ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Data Source</span>
                                <span className="info-value">{report.data_source || 'KPI'}</span>
                            </div>
                        </div>
                    </div>

                    {report.description && (
                        <div className="detail-section">
                            <h3>Description</h3>
                            <p className="report-description">{report.description}</p>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>Metadata</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">
                                    <FiUser size={14} />
                                    Owner
                                </span>
                                <span className="info-value">
                                    {report.owner?.name || report.owner?.email || 'Unknown'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiCalendar size={14} />
                                    Created
                                </span>
                                <span className="info-value">{formatDate(report.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock size={14} />
                                    Last Generated
                                </span>
                                <span className="info-value">{formatDate(report.last_generated_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiTag size={14} />
                                    Version
                                </span>
                                <span className="info-value">v{report.version || 1}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="detail-section">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions">
                            <button
                                className="quick-action-btn"
                                onClick={handleGenerate}
                                disabled={report.status === 'generating'}
                            >
                                <FiPlay size={20} />
                                <span>Generate Report</span>
                            </button>
                            <button
                                className="quick-action-btn"
                                onClick={handleExport}
                            >
                                <FiDownload size={20} />
                                <span>Export Report</span>
                            </button>
                            <button
                                className="quick-action-btn"
                                onClick={() => {
                                    setNewStatus(report.status);
                                    setShowStatusModal(true);
                                }}
                            >
                                <FiRefreshCw size={20} />
                                <span>Change Status</span>
                            </button>
                        </div>
                    </div>

                    {report.tags && report.tags.length > 0 && (
                        <div className="detail-section">
                            <h3>Tags</h3>
                            <div className="tags-container">
                                {report.tags.map((tag, idx) => (
                                    <span key={idx} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {report.allowed_roles && report.allowed_roles.length > 0 && (
                        <div className="detail-section">
                            <h3>Access Control</h3>
                            <div className="allowed-roles">
                                {report.allowed_roles.map((role, idx) => (
                                    <span key={idx} className="role-badge">{role}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ReportHistory reportId={id} />

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Report"
                message={`Are you sure you want to delete the report "${report.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            {showStatusModal && (
                <div className="status-modal-overlay">
                    <div className="status-modal">
                        <div className="modal-header">
                            <h3>Change Status</h3>
                            <button className="modal-close" onClick={() => setShowStatusModal(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="status-select"
                            >
                                <option value="draft">Draft</option>
                                <option value="queued">Queued</option>
                                <option value="generating">Generating</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowStatusModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleStatusChange}>
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};