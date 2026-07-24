// frontend/src/components/reports/audits/AuditTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye } from 'react-icons/fi';
import { AuditStatusBadge } from './AuditStatusBadge';
import './audits.css';

export const AuditTable = ({ audits = [], onView }) => {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getActionLabel = (action) => {
        const labels = {
            view: 'View',
            create: 'Create',
            edit: 'Edit',
            delete: 'Delete',
            export: 'Export',
            share: 'Share',
            schedule: 'Schedule',
            generate: 'Generate',
            refresh: 'Refresh',
            archive: 'Archive',
            restore: 'Restore',
            permission_change: 'Permission Change',
            config_change: 'Configuration Change',
            login: 'Login',
            logout: 'Logout',
        };
        return labels[action] || action;
    };

    const getActionIcon = (action) => {
        const icons = {
            view: '👁️',
            create: '➕',
            edit: '✏️',
            delete: '🗑️',
            export: '📤',
            share: '🔗',
            schedule: '📅',
            generate: '⚡',
            refresh: '🔄',
            archive: '📦',
            restore: '♻️',
            permission_change: '🔒',
            config_change: '⚙️',
            login: '🔑',
            logout: '🚪',
        };
        return icons[action] || '📋';
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        if (seconds < 1) return '<1s';
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="audit-table-container">
            <table className="audit-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Resource</th>
                        <th>Status</th>
                        <th>IP Address</th>
                        <th>Duration</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {audits.map((audit) => (
                        <tr key={audit.id}>
                            <td>
                                <span className="user-name">
                                    {audit.user_name || audit.user?.name || audit.user?.email || 'Anonymous'}
                                </span>
                            </td>
                            <td>
                                <span className="action-cell">
                                    <span className="action-icon">{getActionIcon(audit.action)}</span>
                                    <span className="action-label">{getActionLabel(audit.action)}</span>
                                </span>
                            </td>
                            <td>
                                <span className="resource-name">
                                    {audit.report_name || audit.report || audit.dashboard_name || audit.dashboard || '-'}
                                </span>
                            </td>
                            <td>
                                <AuditStatusBadge success={audit.success} size="small" />
                            </td>
                            <td>
                                <span className="ip-address">{audit.ip_address || '-'}</span>
                            </td>
                            <td>{formatDuration(audit.duration)}</td>
                            <td>{formatDate(audit.created_at)}</td>
                            <td>
                                <button
                                    className="action-btn view"
                                    onClick={() => onView?.(audit.id)}
                                    title="View Details"
                                >
                                    <FiEye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

AuditTable.propTypes = {
    audits: PropTypes.array,
    onView: PropTypes.func,
};