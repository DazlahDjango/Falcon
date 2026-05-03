// frontend/src/components/tenant/migrations/MigrationListTable.jsx
import React from 'react';
import { MigrationStatusBadge } from './MigrationStatusBadge';
import './migrations.css';

export const MigrationListTable = ({ migrations, onViewDetails, loading = false }) => {
    if (loading) {
        return (
            <div className="migration-table-container">
                <div className="text-center p-8 text-gray-500">Loading migrations...</div>
            </div>
        );
    }

    if (!migrations || migrations.length === 0) {
        return (
            <div className="migration-table-container">
                <div className="text-center p-8 text-gray-500">No migrations found</div>
            </div>
        );
    }

    const formatDuration = (startedAt, completedAt) => {
        if (!startedAt || !completedAt) return '-';
        const duration = (new Date(completedAt) - new Date(startedAt)) / 1000;
        if (duration < 60) return `${duration.toFixed(1)}s`;
        if (duration < 3600) return `${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`;
        return `${(duration / 3600).toFixed(1)}h`;
    };

    return (
        <div className="migration-table-container">
            <div className="overflow-x-auto">
                <table className="migration-table">
                    <thead>
                        <tr>
                            <th>Migration Name</th>
                            <th>App</th>
                            <th>Status</th>
                            <th>Started</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {migrations.map((migration) => (
                            <tr
                                key={migration.id}
                                onClick={() => onViewDetails?.(migration.id)}
                            >
                                <td className="font-mono text-sm">{migration.migration_name}</td>
                                <td>
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                        {migration.app_name}
                                    </span>
                                </td>
                                <td><MigrationStatusBadge status={migration.status} /></td>
                                <td>{migration.started_at ? new Date(migration.started_at).toLocaleString() : '-'}</td>
                                <td>{formatDuration(migration.started_at, migration.completed_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};