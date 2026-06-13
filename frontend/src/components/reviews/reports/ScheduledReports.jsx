// src/components/reviews/reports/ScheduledReports.jsx
import React from 'react';
import './reports.css';

const ScheduledReports = ({ schedules = [], onEdit, onDelete, onToggle, loading = false }) => {
    const formatCron = (cron) => {
        if (!cron) return 'Not scheduled';
        // Simple cron to text mapping
        if (cron === '0 9 * * 1') return 'Every Monday at 9:00 AM';
        if (cron === '0 9 1 * *') return 'First day of every month at 9:00 AM';
        if (cron === '0 9 * * *') return 'Every day at 9:00 AM';
        return cron;
    };

    if (loading) {
        return <div className="report-loading">Loading scheduled reports...</div>;
    }

    if (!schedules || schedules.length === 0) {
        return (
            <div className="report-card">
                <div className="report-card-header">
                    <h3 className="report-card-title">Scheduled Reports</h3>
                </div>
                <div className="report-card-body">
                    <div className="report-empty">
                        <p>No scheduled reports.</p>
                        <p>Schedule reports to be automatically generated and emailed.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="report-card">
            <div className="report-card-header">
                <h3 className="report-card-title">Scheduled Reports</h3>
            </div>
            <div className="report-card-body">
                {schedules.map(schedule => (
                    <div key={schedule.id} className="schedule-item">
                        <div className="schedule-header">
                            <span className="schedule-name">{schedule.name}</span>
                            <span className={`schedule-badge ${schedule.is_active ? 'active' : 'inactive'}`}>
                                {schedule.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="schedule-details">
                            <div>📅 {formatCron(schedule.schedule_cron)}</div>
                            <div>📧 Recipients: {schedule.recipients?.length || 0}</div>
                            <div>📄 Report: {schedule.report_type}</div>
                        </div>
                        <div className="schedule-actions">
                            {onToggle && (
                                <button
                                    className="action-btn"
                                    onClick={() => onToggle(schedule.id, !schedule.is_active)}
                                    title={schedule.is_active ? 'Pause' : 'Activate'}
                                >
                                    {schedule.is_active ? '⏸️ Pause' : '▶️ Activate'}
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    className="action-btn"
                                    onClick={() => onEdit(schedule)}
                                    title="Edit"
                                >
                                    ✏️ Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    className="action-btn"
                                    onClick={() => onDelete(schedule.id)}
                                    title="Delete"
                                >
                                    🗑️ Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduledReports;