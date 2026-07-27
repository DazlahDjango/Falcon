// frontend/src/components/reports/schedules/ScheduleDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiPlay,
    FiPause,
    FiClock,
    FiCalendar,
    FiUser,
    FiMail,
    FiGlobe,
} from 'react-icons/fi';
import { useSchedule } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';
import { ScheduleHistory } from './ScheduleHistory';
import { ScheduleUpcomingRuns } from './ScheduleUpcomingRuns';
import { ScheduleActions } from './ScheduleActions';
import './schedules.css';

export const ScheduleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();

    const {
        schedule,
        loading,
        error,
        fetchOne,
        remove,
        performAction,
        clearErrors,
    } = useSchedule(id, { autoFetch: true });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleBack = () => {
        navigate('/reports/schedules');
    };

    const handleEdit = () => {
        navigate(`/reports/schedules/${id}/edit`);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await remove(id);
        navigate('/reports/schedules');
    };

    const handleAction = async (action) => {
        await performAction(id, action);
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
        });
    };

    const getFrequencyLabel = (frequency) => {
        const labels = {
            daily: 'Daily',
            weekly: 'Weekly',
            biweekly: 'Bi-Weekly',
            monthly: 'Monthly',
            quarterly: 'Quarterly',
            biannual: 'Bi-Annual',
            annual: 'Annual',
            custom: 'Custom',
        };
        return labels[frequency] || frequency;
    };

    const getDeliveryMethodLabel = (method) => {
        if (!method) return 'Not configured';
        if (Array.isArray(method)) return method.join(', ');
        return method;
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading schedule..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load schedule"
            />
        );
    }

    if (!schedule) {
        return <ReportError error="Schedule not found" title="Schedule not found" />;
    }

    const isOverdue = () => {
        if (!schedule.next_run_at) return false;
        return new Date(schedule.next_run_at) < new Date() && schedule.is_active && !schedule.is_paused;
    };

    return (
        <div className="schedule-detail-container">
            <div className="schedule-detail-header">
                <div className="header-left">
                    <button className="btn btn-outline back-btn" onClick={handleBack}>
                        <FiArrowLeft size={18} />
                        Back to Schedules
                    </button>
                    <h1 className="schedule-title">{schedule.name}</h1>
                    <ScheduleStatusBadge
                        isActive={schedule.is_active}
                        isPaused={schedule.is_paused}
                        status={schedule.status}
                    />
                    {isOverdue() && (
                        <span className="overdue-badge-large">⚠️ Overdue</span>
                    )}
                </div>
                <div className="header-right">
                    <ScheduleActions
                        schedule={schedule}
                        onAction={handleAction}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <div className="schedule-detail-grid">
                <div className="detail-main">
                    <div className="detail-section">
                        <h3>Schedule Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Name</span>
                                <span className="info-value">{schedule.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Frequency</span>
                                <span className="info-value">{getFrequencyLabel(schedule.frequency)}</span>
                            </div>
                            {schedule.cron_expression && (
                                <div className="info-item">
                                    <span className="info-label">Cron Expression</span>
                                    <span className="info-value">
                                        <code>{schedule.cron_expression}</code>
                                    </span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">Timezone</span>
                                <span className="info-value">{schedule.timezone || 'UTC'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiCalendar size={14} />
                                    Next Run
                                </span>
                                <span className="info-value">{formatDate(schedule.next_run_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock size={14} />
                                    Last Run
                                </span>
                                <span className="info-value">{formatDate(schedule.last_run_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Retry Count</span>
                                <span className="info-value">
                                    {schedule.retry_count} / {schedule.max_retries}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Expires</span>
                                <span className="info-value">
                                    {schedule.expires_at ? formatDate(schedule.expires_at) : 'Never'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Report</h3>
                        <div className="report-info">
                            <span className="report-name">
                                {schedule.report_name || schedule.report || 'Unknown'}
                            </span>
                            {schedule.report_id && (
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => navigate(`/reports/${schedule.report_id}`)}
                                >
                                    View Report
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Delivery Configuration</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">
                                    <FiMail size={14} />
                                    Delivery Method
                                </span>
                                <span className="info-value">{getDeliveryMethodLabel(schedule.delivery_method)}</span>
                            </div>
                            {schedule.recipients && schedule.recipients.length > 0 && (
                                <div className="info-item">
                                    <span className="info-label">Recipients</span>
                                    <span className="info-value">
                                        {schedule.recipients.join(', ')}
                                    </span>
                                </div>
                            )}
                            {schedule.webhook_url && (
                                <div className="info-item">
                                    <span className="info-label">Webhook URL</span>
                                    <span className="info-value">
                                        <code className="webhook-url">{schedule.webhook_url}</code>
                                    </span>
                                </div>
                            )}
                            {schedule.s3_path && (
                                <div className="info-item">
                                    <span className="info-label">S3 Path</span>
                                    <span className="info-value">
                                        <code className="s3-path">{schedule.s3_path}</code>
                                    </span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">Include Attachments</span>
                                <span className="info-value">
                                    {schedule.include_attachments ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Compress Attachments</span>
                                <span className="info-value">
                                    {schedule.compress_attachments ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Password Protected</span>
                                <span className="info-value">
                                    {schedule.password_protect ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {schedule.custom_params && Object.keys(schedule.custom_params).length > 0 && (
                        <div className="detail-section">
                            <h3>Custom Parameters</h3>
                            <pre className="params-json">
                                {JSON.stringify(schedule.custom_params, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="detail-sidebar">
                    <div className="detail-section">
                        <h3>Metadata</h3>
                        <div className="info-grid single">
                            <div className="info-item">
                                <span className="info-label">
                                    <FiUser size={14} />
                                    Owner
                                </span>
                                <span className="info-value">
                                    {schedule.owner?.name || schedule.owner?.email || 'Unknown'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiCalendar size={14} />
                                    Created
                                </span>
                                <span className="info-value">{formatDate(schedule.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiGlobe size={14} />
                                    Status
                                </span>
                                <span className="info-value">
                                    <ScheduleStatusBadge
                                        isActive={schedule.is_active}
                                        isPaused={schedule.is_paused}
                                        status={schedule.status}
                                        size="medium"
                                    />
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Last Run Status</span>
                                <span className="info-value">
                                    {schedule.last_run_status || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <ScheduleUpcomingRuns scheduleId={id} />

                    {schedule.retry_count > 0 && (
                        <div className="detail-section retry-info">
                            <h3>Retry Information</h3>
                            <div className="info-grid single">
                                <div className="info-item">
                                    <span className="info-label">Retry Count</span>
                                    <span className="info-value">{schedule.retry_count}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Max Retries</span>
                                    <span className="info-value">{schedule.max_retries}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Retry Delay</span>
                                    <span className="info-value">{schedule.retry_delay}s</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ScheduleHistory scheduleId={id} />

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Schedule"
                message={`Are you sure you want to delete the schedule "${schedule.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};