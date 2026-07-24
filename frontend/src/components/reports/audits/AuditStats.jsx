// frontend/src/components/reports/audits/AuditStats.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    FiActivity,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiBarChart2,
    FiUser,
} from 'react-icons/fi';
import './audits.css';

export const AuditStats = ({ stats = {}, className = '' }) => {
    const {
        total = 0,
        by_action = [],
        by_success = [],
        avg_duration = 0,
    } = stats;

    const getActionColor = (action) => {
        const colors = {
            view: '#3b82f6',
            create: '#10b981',
            edit: '#f59e0b',
            delete: '#ef4444',
            export: '#8b5cf6',
            share: '#ec4899',
            schedule: '#14b8a6',
            generate: '#f97316',
            refresh: '#6366f1',
            archive: '#64748b',
            restore: '#22d3ee',
            permission_change: '#f43f5e',
            config_change: '#8b5cf6',
            login: '#10b981',
            logout: '#94a3b8',
        };
        return colors[action] || '#94a3b8';
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
            permission_change: 'Permission',
            config_change: 'Config',
            login: 'Login',
            logout: 'Logout',
        };
        return labels[action] || action;
    };

    const successCount = by_success.find((s) => s.success === true)?.count || 0;
    const failedCount = by_success.find((s) => s.success === false)?.count || 0;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        if (seconds < 1) return '<1s';
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className={`audit-stats ${className}`}>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiActivity size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{total.toLocaleString()}</span>
                        <span className="stat-label">Total Events</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">
                        <FiCheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{successCount.toLocaleString()}</span>
                        <span className="stat-label">
                            Success ({successRate.toFixed(1)}%)
                        </span>
                    </div>
                </div>

                <div className="stat-card failed">
                    <div className="stat-icon">
                        <FiXCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{failedCount.toLocaleString()}</span>
                        <span className="stat-label">
                            Failed ({(100 - successRate).toFixed(1)}%)
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiClock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{formatDuration(avg_duration)}</span>
                        <span className="stat-label">Avg Duration</span>
                    </div>
                </div>
            </div>

            {by_action && by_action.length > 0 && (
                <div className="stats-actions">
                    <h4 className="stats-subtitle">
                        <FiBarChart2 size={16} />
                        Actions Breakdown
                    </h4>
                    <div className="actions-bars">
                        {by_action.slice(0, 10).map((item) => {
                            const percentage = total > 0 ? (item.count / total) * 100 : 0;
                            const color = getActionColor(item.action);
                            return (
                                <div key={item.action} className="action-bar-item">
                                    <div className="action-bar-label">
                                        <span className="action-name">{getActionLabel(item.action)}</span>
                                        <span className="action-count">{item.count}</span>
                                    </div>
                                    <div className="action-bar-track">
                                        <div
                                            className="action-bar-fill"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {stats.by_user && stats.by_user.length > 0 && (
                <div className="stats-users">
                    <h4 className="stats-subtitle">
                        <FiUser size={16} />
                        Top Users
                    </h4>
                    <div className="users-list">
                        {stats.by_user.slice(0, 5).map((item) => (
                            <div key={item.user} className="user-item">
                                <span className="user-name">
                                    {item.user_name || item.user || 'Anonymous'}
                                </span>
                                <span className="user-count">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

AuditStats.propTypes = {
    stats: PropTypes.shape({
        total: PropTypes.number,
        by_action: PropTypes.array,
        by_success: PropTypes.array,
        by_user: PropTypes.array,
        avg_duration: PropTypes.number,
    }),
    className: PropTypes.string,
};