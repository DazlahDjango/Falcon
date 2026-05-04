// frontend/src/components/tenant/backups/BackupCard.jsx
import React from 'react';
import { BackupStatusBadge } from './BackupStatusBadge';
import { BackupDownloadButton } from './BackupDownloadButton';
import './backups.css';

export const BackupCard = ({ backup, onRestore, onDelete, onDownload }) => {
    const getTypeClass = () => {
        switch (backup.backup_type) {
            case 'full': return 'backup-type-full';
            case 'schema': return 'backup-type-schema';
            case 'data': return 'backup-type-data';
            case 'incremental': return 'backup-type-incremental';
            default: return 'backup-type-full';
        }
    };

    const getTypeLabel = () => {
        switch (backup.backup_type) {
            case 'full': return 'Full Backup';
            case 'schema': return 'Schema Only';
            case 'data': return 'Data Only';
            case 'incremental': return 'Incremental';
            default: return backup.backup_type;
        }
    };

    const duration = backup.started_at && backup.completed_at
        ? `${Math.round((new Date(backup.completed_at) - new Date(backup.started_at)) / 1000)} seconds`
        : '-';

    return (
        <div className="backup-card">
            <div className="backup-card-header">
                <span className={`backup-card-type ${getTypeClass()}`}>
                    {getTypeLabel()}
                </span>
                <div className="backup-card-actions">
                    {backup.status === 'completed' && (
                        <BackupDownloadButton onDownload={() => onDownload?.(backup.id)} />
                    )}
                    <button
                        onClick={() => onDelete?.(backup.id)}
                        className="backup-btn backup-btn-danger backup-btn-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <BackupStatusBadge status={backup.status} />

            <div className="backup-card-details">
                <div className="backup-card-detail">
                    <span className="backup-card-detail-label">Size:</span>
                    <span className="backup-card-detail-value">
                        {backup.file_size_mb ? `${backup.file_size_mb} MB` : '-'}
                    </span>
                </div>
                <div className="backup-card-detail">
                    <span className="backup-card-detail-label">Created:</span>
                    <span className="backup-card-detail-value">
                        {new Date(backup.created_at).toLocaleString()}
                    </span>
                </div>
                {backup.status === 'completed' && (
                    <div className="backup-card-detail">
                        <span className="backup-card-detail-label">Duration:</span>
                        <span className="backup-card-detail-value">{duration}</span>
                    </div>
                )}
                {backup.status === 'failed' && backup.error_message && (
                    <div className="backup-card-detail">
                        <span className="backup-card-detail-label">Error:</span>
                        <span className="backup-card-detail-value text-red-600">{backup.error_message}</span>
                    </div>
                )}
            </div>

            {backup.status === 'completed' && (
                <div className="mt-3 pt-2">
                    <button
                        onClick={() => onRestore?.(backup.id)}
                        className="backup-btn backup-btn-primary w-full"
                    >
                        Restore from Backup
                    </button>
                </div>
            )}
        </div>
    );
};