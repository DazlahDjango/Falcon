// frontend/src/components/tenant/backups/BackupStatusBadge.jsx
import React from 'react';
import './backups.css';

export const BackupStatusBadge = ({ status }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'completed':
                return 'backup-status-completed';
            case 'pending':
                return 'backup-status-pending';
            case 'running':
                return 'backup-status-running';
            case 'failed':
                return 'backup-status-failed';
            case 'cancelled':
                return 'backup-status-cancelled';
            default:
                return 'backup-status-pending';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'pending':
                return 'Pending';
            case 'running':
                return 'Running';
            case 'failed':
                return 'Failed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'completed':
                return '✅';
            case 'pending':
                return '⏳';
            case 'running':
                return '🔄';
            case 'failed':
                return '❌';
            default:
                return '📦';
        }
    };

    return (
        <span className={`backup-status-badge ${getStatusClass()}`}>
            {getIcon()} {getStatusLabel()}
        </span>
    );
};