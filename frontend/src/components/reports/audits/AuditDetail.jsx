// frontend/src/components/reports/audits/AuditDetail.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiUser,
    FiClock,
    FiGlobe,
    FiCheckCircle,
    FiXCircle,
    FiInfo,
} from 'react-icons/fi';
import { useAudit } from '../../../hooks/reports';
import { ReportLoading, ReportError } from '../common';
import { AuditStatusBadge } from './AuditStatusBadge';
import './audits.css';

export const AuditDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        audit,
        loading,
        error,
        fetchOne,
        clearErrors,
    } = useAudit(id, { autoFetch: true });

    const handleBack = () => {
        navigate('/reports/audits');
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
            timeZoneName: 'short',
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        if (seconds < 1) return '<1s';
        if (seconds < 60) return `${seconds.toFixed(2)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const getActionLabel = (action) => {
        const labels = {
            view: 'View',
            create: 'Create',
            edit: 'Edit',
            delete: 'Delete',
            export: 'Export',
            share: 'Share',
            schedule: 'Schedule',
            generate: 'Generate',
            refresh: 'Refresh',
            archive: 'Archive',
            restore: 'Restore',
            permission_change: 'Permission Change',
            config_change: 'Configuration Change',
            login: 'Login',
            logout: 'Logout',
        };
        return labels[action] || action;
    };

    const getActionIcon = (action) => {
        const icons = {
            view: '👁️',
            create: '➕',
            edit: '✏️',
            delete: '🗑️',
            export: '📤',
            share: '🔗',
            schedule: '📅',
            generate: '⚡',
            refresh: '🔄',
            archive: '📦',
            restore: '♻️',
            permission_change: '🔒',
            config_change: '⚙️',
            login: '🔑',
            logout: '🚪',
        };
        return icons[action] || '📋';
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading audit details..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load audit details"
            />
        );
    }

    if (!audit) {
        return <ReportError error="Audit record not found" title="Record not found" />;
    }

    return (
        <div className="audit-detail-container">
            <div className="audit-detail-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Audit Logs
                </button>
                <h1 className="page-title">Audit Details</h1>
                <AuditStatusBadge success={audit.success} size="large" />
            </div>

            <div className="audit-detail-grid">
                <div className="detail-main">
                    <div className="detail-section">
                        <h3>Audit Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Audit ID</span>
                                <span className="info-value code">{audit.id}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiUser size={14} />
                                    User
                                </span>
                                <span className="info-value">
                                    {audit.user_name || audit.user?.name || audit.user?.email || 'Anonymous'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Action</span>
                                <span className="info-value">
                                    <span className="action-display">
                                        <span className="action-icon">{getActionIcon(audit.action)}</span>
                                        {getActionLabel(audit.action)}
                                    </span>
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiGlobe size={14} />
                                    IP Address
                                </span>
                                <span className="info-value">{audit.ip_address || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">User Agent</span>
                                <span className="info-value user-agent">{audit.user_agent || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Session ID</span>
                                <span className="info-value code">{audit.session_id || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock size={14} />
                                    Timestamp
                                </span>
                                <span className="info-value">{formatDate(audit.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Duration</span>
                                <span className="info-value">{formatDuration(audit.duration)}</span>
                            </div>
                        </div>
                    </div>

                    {audit.report && (
                        <div className="detail-section">
                            <h3>Report</h3>
                            <div className="resource-info">
                                <span className="resource-name">
                                    {audit.report_name || audit.report}
                                </span>
                                <span className="resource-id">ID: {audit.report}</span>
                            </div>
                        </div>
                    )}

                    {audit.dashboard && (
                        <div className="detail-section">
                            <h3>Dashboard</h3>
                            <div className="resource-info">
                                <span className="resource-name">
                                    {audit.dashboard_name || audit.dashboard}
                                </span>
                                <span className="resource-id">ID: {audit.dashboard}</span>
                            </div>
                        </div>
                    )}

                    {audit.error_message && (
                        <div className="detail-section error-section">
                            <h3>
                                <FiXCircle size={16} />
                                Error Details
                            </h3>
                            <div className="error-container">
                                <p className="error-message">{audit.error_message}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="detail-sidebar">
                    <div className="detail-section">
                        <h3>
                            <FiInfo size={14} />
                            Details
                        </h3>
                        <div className="info-grid single">
                            <div className="info-item">
                                <span className="info-label">Success</span>
                                <span className="info-value">
                                    <AuditStatusBadge success={audit.success} size="medium" />
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Created</span>
                                <span className="info-value">{formatDate(audit.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Updated</span>
                                <span className="info-value">{formatDate(audit.updated_at)}</span>
                            </div>
                        </div>
                    </div>

                    {audit.details && Object.keys(audit.details).length > 0 && (
                        <div className="detail-section">
                            <h3>Additional Details</h3>
                            <pre className="details-json">
                                {JSON.stringify(audit.details, null, 2)}
                            </pre>
                        </div>
                    )}

                    {audit.changes && Object.keys(audit.changes).length > 0 && (
                        <div className="detail-section">
                            <h3>Changes</h3>
                            <pre className="details-json">
                                {JSON.stringify(audit.changes, null, 2)}
                            </pre>
                        </div>
                    )}

                    {audit.previous_value && (
                        <div className="detail-section">
                            <h3>Previous Value</h3>
                            <pre className="details-json">
                                {JSON.stringify(audit.previous_value, null, 2)}
                            </pre>
                        </div>
                    )}

                    {audit.new_value && (
                        <div className="detail-section">
                            <h3>New Value</h3>
                            <pre className="details-json">
                                {JSON.stringify(audit.new_value, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};