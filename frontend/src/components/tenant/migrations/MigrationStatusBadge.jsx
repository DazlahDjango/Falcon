// frontend/src/components/tenant/migrations/MigrationStatusBadge.jsx
import React from 'react';
import './migrations.css';

export const MigrationStatusBadge = ({ status }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'completed':
                return 'migration-status-completed';
            case 'pending':
                return 'migration-status-pending';
            case 'running':
                return 'migration-status-running';
            case 'failed':
                return 'migration-status-failed';
            case 'rolled_back':
                return 'migration-status-rolled-back';
            default:
                return 'migration-status-pending';
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
            case 'rolled_back':
                return 'Rolled Back';
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
            case 'rolled_back':
                return '↩️';
            default:
                return '📋';
        }
    };

    return (
        <span className={`migration-status-badge ${getStatusClass()}`}>
            {getIcon()} {getStatusLabel()}
        </span>
    );
};