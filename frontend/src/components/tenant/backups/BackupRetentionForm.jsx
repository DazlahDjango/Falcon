// frontend/src/components/tenant/backups/BackupRetentionForm.jsx
import React, { useState } from 'react';
import './backups.css';

export const BackupRetentionForm = ({ initialDays, onSubmit, onCancel, isLoading = false }) => {
    const [retentionDays, setRetentionDays] = useState(initialDays || 30);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(retentionDays);
    };

    return (
        <form onSubmit={handleSubmit} className="retention-form">
            <div className="backup-form-group">
                <label className="backup-form-label">Retention Period (Days)</label>
                <input
                    type="number"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(parseInt(e.target.value) || 0)}
                    min="1"
                    max="365"
                    className="backup-form-input"
                    disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Backups older than this will be automatically deleted.
                    Recommended: 30 days for basic, 90 days for enterprise.
                </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} className="backup-btn backup-btn-secondary">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading} className="backup-btn backup-btn-primary">
                    {isLoading ? 'Saving...' : 'Save Retention Policy'}
                </button>
            </div>
        </form>
    );
};