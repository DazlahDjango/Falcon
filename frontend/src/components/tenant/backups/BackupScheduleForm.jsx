// frontend/src/components/tenant/backups/BackupScheduleForm.jsx
import React, { useState } from 'react';
import './backups.css';

export const BackupScheduleForm = ({ initialSchedule, onSubmit, onCancel, isLoading = false }) => {
    const [enabled, setEnabled] = useState(initialSchedule?.enabled || false);
    const [frequency, setFrequency] = useState(initialSchedule?.frequency || 'daily');
    const [time, setTime] = useState(initialSchedule?.time || '02:00');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ enabled, frequency, time });
    };

    return (
        <form onSubmit={handleSubmit} className="backup-schedule-form">
            <div className="backup-form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        disabled={isLoading}
                    />
                    <span className="backup-form-label">Enable Automatic Backups</span>
                </label>
            </div>

            {enabled && (
                <>
                    <div className="backup-form-group">
                        <label className="backup-form-label">Frequency</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="backup-form-select"
                            disabled={isLoading}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div className="backup-form-group">
                        <label className="backup-form-label">Time (UTC)</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="backup-form-input"
                            disabled={isLoading}
                        />
                    </div>
                </>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="backup-btn backup-btn-secondary">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading} className="backup-btn backup-btn-primary">
                    {isLoading ? 'Saving...' : 'Save Schedule'}
                </button>
            </div>
        </form>
    );
};