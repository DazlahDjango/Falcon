// frontend/src/components/tenant/backups/BackupProgressBar.jsx
import React from 'react';
import './backups.css';

export const BackupProgressBar = ({ progress, status, message }) => {
    if (status !== 'running') return null;

    return (
        <div className="backup-progress-container">
            <div className="backup-progress-bar">
                <div
                    className="backup-progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="backup-progress-text">
                {message || `Creating backup... ${progress}%`}
            </div>
        </div>
    );
};