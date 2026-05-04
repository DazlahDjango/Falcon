// frontend/src/components/tenant/backups/BackupListTable.jsx
import React from 'react';
import { BackupStatusBadge } from './BackupStatusBadge';
import { BackupDownloadButton } from './BackupDownloadButton';
import './backups.css';

export const BackupListTable = ({ backups, onRestore, onDelete, onDownload, loading = false }) => {
    if (loading) {
        return (
            <div className="backup-table-container">
                <div className="text-center p-8 text-gray-500">Loading backups...</div>
            </div>
        );
    }

    if (!backups || backups.length === 0) {
        return (
            <div className="backup-table-container">
                <div className="text-center p-8 text-gray-500">No backups available</div>
            </div>
        );
    }

    const getTypeClass = (type) => {
        switch (type) {
            case 'full': return 'backup-type-full';
            case 'schema': return 'backup-type-schema';
            case 'data': return 'backup-type-data';
            case 'incremental': return 'backup-type-incremental';
            default: return 'backup-type-full';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'full': return 'Full';
            case 'schema': return 'Schema';
            case 'data': return 'Data';
            case 'incremental': return 'Incremental';
            default: return type;
        }
    };

    return (
        <div className="backup-table-container">
            <div className="overflow-x-auto">
                <table className="backup-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Size</th>
                            <th>Created</th>
                            <th>Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.map((backup) => {
                            const duration = backup.started_at && backup.completed_at
                                ? `${Math.round((new Date(backup.completed_at) - new Date(backup.started_at)) / 1000)}s`
                                : '-';

                            return (
                                <tr key={backup.id}>
                                    <td>
                                        <span className={`backup-card-type ${getTypeClass(backup.backup_type)}`}>
                                            {getTypeLabel(backup.backup_type)}
                                        </span>
                                    </td>
                                    <td><BackupStatusBadge status={backup.status} /></td>
                                    <td>{backup.file_size_mb ? `${backup.file_size_mb} MB` : '-'}</td>
                                    <td>{new Date(backup.created_at).toLocaleString()}</td>
                                    <td>{backup.status === 'completed' ? duration : '-'}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            {backup.status === 'completed' && (
                                                <>
                                                    <BackupDownloadButton onDownload={() => onDownload?.(backup.id)} />
                                                    <button
                                                        onClick={() => onRestore?.(backup.id)}
                                                        className="backup-btn backup-btn-primary backup-btn-sm"
                                                    >
                                                        Restore
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => onDelete?.(backup.id)}
                                                className="backup-btn backup-btn-danger backup-btn-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </table>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};