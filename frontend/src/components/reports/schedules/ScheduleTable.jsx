// frontend/src/components/reports/schedules/ScheduleTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEdit2, FiTrash2, FiPlay, FiPause, FiClock } from 'react-icons/fi';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';
import './schedules.css';

export const ScheduleTable = ({
    schedules = [],
    onView,
    onEdit,
    onDelete,
    onRunNow,
}) => {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
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

    const isOverdue = (schedule) => {
        if (!schedule.next_run_at) return false;
        return new Date(schedule.next_run_at) < new Date() && schedule.is_active;
    };

    return (
        <div className="schedule-table-container">
            <table className="schedule-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Report</th>
                        <th>Frequency</th>
                        <th>Status</th>
                        <th>Next Run</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map((schedule) => (
                        <tr key={schedule.id}>
                            <td>
                                <span className="schedule-name">{schedule.name}</span>
                            </td>
                            <td>{schedule.report_name || schedule.report}</td>
                            <td>
                                <span className="frequency-badge">
                                    {getFrequencyLabel(schedule.frequency)}
                                </span>
                            </td>
                            <td>
                                <ScheduleStatusBadge
                                    isActive={schedule.is_active}
                                    isPaused={schedule.is_paused}
                                    status={schedule.status}
                                    size="small"
                                />
                                {isOverdue(schedule) && (
                                    <span className="overdue-indicator">⚠️</span>
                                )}
                            </td>
                            <td>{formatDate(schedule.next_run_at)}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn view"
                                        onClick={() => onView?.(schedule.id)}
                                        title="View Schedule"
                                    >
                                        <FiEye size={16} />
                                    </button>
                                    <button
                                        className="action-btn run"
                                        onClick={() => onRunNow?.(schedule.id)}
                                        title="Run Now"
                                        disabled={!schedule.is_active || schedule.is_paused}
                                    >
                                        <FiPlay size={16} />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        onClick={() => onEdit?.(schedule.id)}
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

ScheduleTable.propTypes = {
    schedules: PropTypes.array,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onRunNow: PropTypes.func,
};