// frontend/src/components/tenant/migrations/MigrationDetailsModal.jsx
import React from 'react';
import { MigrationStatusBadge } from './MigrationStatusBadge';
import './migrations.css';

export const MigrationDetailsModal = ({ isOpen, onClose, migration }) => {
    if (!isOpen || !migration) return null;

    const formatDuration = () => {
        if (!migration.started_at || !migration.completed_at) return '-';
        const duration = (new Date(migration.completed_at) - new Date(migration.started_at)) / 1000;
        if (duration < 60) return `${duration.toFixed(1)} seconds`;
        if (duration < 3600) return `${Math.floor(duration / 60)} minutes ${Math.floor(duration % 60)} seconds`;
        return `${(duration / 3600).toFixed(1)} hours`;
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="migration-modal-overlay" onClick={onClose}>
            <div className="migration-modal" onClick={(e) => e.stopPropagation()}>
                <div className="migration-modal-header">
                    <h3 className="migration-modal-title">Migration Details</h3>
                    <button onClick={onClose} className="migration-modal-close">✕</button>
                </div>

                <div className="migration-modal-body">
                    <div className="migration-detail-section">
                        <div className="migration-detail-label">Migration Name</div>
                        <div className="migration-detail-value">{migration.migration_name}</div>
                    </div>

                    <div className="migration-detail-section">
                        <div className="migration-detail-label">App Name</div>
                        <div className="migration-detail-value">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                {migration.app_name}
                            </span>
                        </div>
                    </div>

                    <div className="migration-detail-section">
                        <div className="migration-detail-label">Status</div>
                        <div><MigrationStatusBadge status={migration.status} /></div>
                    </div>

                    <div className="migration-detail-section">
                        <div className="migration-detail-label">Started At</div>
                        <div className="migration-detail-value">{formatTimestamp(migration.started_at)}</div>
                    </div>

                    <div className="migration-detail-section">
                        <div className="migration-detail-label">Completed At</div>
                        <div className="migration-detail-value">{formatTimestamp(migration.completed_at)}</div>
                    </div>

                    <div className="migration-detail-section">
                        <div className="migration-detail-label">Duration</div>
                        <div className="migration-detail-value">{formatDuration()}</div>
                    </div>

                    {migration.is_rollback && (
                        <div className="migration-detail-section">
                            <div className="migration-detail-label">Rollback Info</div>
                            <div className="migration-detail-value">
                                Rolled back from: {migration.rolled_back_from}
                            </div>
                        </div>
                    )}

                    {migration.status === 'failed' && migration.error_message && (
                        <div className="migration-error">
                            <div className="migration-error-title">Error Details</div>
                            <div className="migration-error-message">{migration.error_message}</div>
                            {migration.error_traceback && (
                                <details className="mt-2">
                                    <summary className="text-xs text-gray-600 cursor-pointer">View Traceback</summary>
                                    <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap overflow-x-auto">
                                        {migration.error_traceback}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}
                </div>

                <div className="migration-modal-footer">
                    <button onClick={onClose} className="migration-btn migration-btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};