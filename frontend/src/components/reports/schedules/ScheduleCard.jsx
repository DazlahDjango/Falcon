// frontend/src/components/reports/schedules/ScheduleCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiPlay, FiPause, FiClock } from 'react-icons/fi';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';
import './schedules.css';

export const ScheduleCard = ({
    schedule,
    onView,
    onEdit,
    onDelete,
    onRunNow,
    className = '',
}) => {
    const {
        id,
        name,
        report,
        report_name,
        frequency,
        status,
        is_active,
        is_paused,
        next_run_at,
        last_run_at,
        recipients,
        delivery_method,
    } = schedule || {};

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getFrequencyLabel = (freq) => {
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
        return labels[freq] || freq;
    };

    const getFrequencyIcon = (freq) => {
        const icons = {
            daily: '📅',
            weekly: '📆',
            biweekly: '📆',
            monthly: '📅',
            quarterly: '📊',
            biannual: '📈',
            annual: '📅',
            custom: '⚙️',
        };
        return icons[freq] || '📅';
    };

    const getDeliveryMethodLabel = (method) => {
        if (!method) return 'Not configured';
        if (Array.isArray(method)) return method.join(', ');
        return method;
    };

    const isOverdue = () => {
        if (!next_run_at) return false;
        return new Date(next_run_at) < new Date() && is_active && !is_paused;
    };

    return (
        <div className={`schedule-card ${className} ${isOverdue() ? 'overdue' : ''}`}>
            <div className="schedule-card-header">
                <div className="schedule-card-type">
                    <span className="type-icon">{getFrequencyIcon(frequency)}</span>
                    <span className="type-label">{getFrequencyLabel(frequency)}</span>
                </div>
                <ScheduleStatusBadge
                    isActive={is_active}
                    isPaused={is_paused}
                    status={status}
                    size="small"
                />
            </div>
            <div className="schedule-card-body">
                <h3 className="schedule-card-title">
                    <Link to={`/reports/schedules/${id}`}>{name}</Link>
                </h3>
                <div className="schedule-card-report">
                    <span className="report-label">Report:</span>
                    <span className="report-name">
                        {report_name || report || 'Unknown'}
                    </span>
                </div>
                <div className="schedule-card-meta">
                    <span className="meta-item">
                        <span className="meta-label">Next Run:</span>
                        <span className="meta-value">{formatDate(next_run_at)}</span>
                        {isOverdue() && (
                            <span className="overdue-badge">Overdue</span>
                        )}
                    </span>
                    <span className="meta-item">
                        <span className="meta-label">Last Run:</span>
                        <span className="meta-value">{formatDate(last_run_at)}</span>
                    </span>
                    {recipients && recipients.length > 0 && (
                        <span className="meta-item">
                            <span className="meta-label">Recipients:</span>
                            <span className="meta-value">{recipients.length}</span>
                        </span>
                    )}
                    <span className="meta-item">
                        <span className="meta-label">Delivery:</span>
                        <span className="meta-value">{getDeliveryMethodLabel(delivery_method)}</span>
                    </span>
                </div>
            </div>
            <div className="schedule-card-actions">
                <button
                    className="action-btn view"
                    onClick={() => onView?.(id)}
                    title="View Schedule"
                >
                    <FiEye size={16} />
                </button>
                <button
                    className="action-btn run"
                    onClick={() => onRunNow?.(id)}
                    title="Run Now"
                    disabled={!is_active || is_paused}
                >
                    <FiPlay size={16} />
                </button>
                <button
                    className="action-btn edit"
                    onClick={() => onEdit?.(id)}
                    title="Edit Schedule"
                >
                    <FiEdit2 size={16} />
                </button>
                <button
                    className="action-btn delete"
                    onClick={() => onDelete?.(schedule)}
                    title="Delete Schedule"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
        </div>
    );
};

ScheduleCard.propTypes = {
    schedule: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        report: PropTypes.string,
        report_name: PropTypes.string,
        frequency: PropTypes.string,
        status: PropTypes.string,
        is_active: PropTypes.bool,
        is_paused: PropTypes.bool,
        next_run_at: PropTypes.string,
        last_run_at: PropTypes.string,
        recipients: PropTypes.array,
        delivery_method: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    }).isRequired,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onRunNow: PropTypes.func,
    className: PropTypes.string,
};