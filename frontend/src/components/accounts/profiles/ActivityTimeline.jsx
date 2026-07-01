import React, { useState, useEffect } from 'react';
import {
    FiLogIn, FiLogOut, FiShield, FiLock, FiUser,
    FiEdit, FiTrash2, FiPlus, FiCheckCircle, FiXCircle,
    FiClock, FiAlertCircle, FiSmartphone, FiMail,
    FiDownload, FiEye, FiSettings, FiRefreshCw,
    FiActivity
} from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import { useAudit } from '../../../hooks/accounts/useAudit';
import { useAuth } from '../../../hooks/accounts/useAuth';
import Spinner from '../../common/UI/Spinner';

const ActivityTimeline = ({ limit = 20, showHeader = true }) => {
    const { user } = useAuth();
    const {
        userActivity,
        isLoading,
        loadUserAuditActivity,
    } = useAudit();

    const [filter, setFilter] = useState('all');
    const [expandedItem, setExpandedItem] = useState(null);

    useEffect(() => {
        if (user?.id) {
            loadUserAuditActivity(user.id, 30);
        }
    }, [user?.id, loadUserAuditActivity]);

    const getActivityIcon = (actionType, action) => {
        const icons = {
            login: <FiLogIn size={16} />,
            logout: <FiLogOut size={16} />,
            create: <FiPlus size={16} />,
            update: <FiEdit size={16} />,
            delete: <FiTrash2 size={16} />,
            approve: <FiCheckCircle size={16} />,
            reject: <FiXCircle size={16} />,
            security: <FiShield size={16} />,
            mfa: <FiSmartphone size={16} />,
            export: <FiDownload size={16} />,
            view: <FiEye size={16} />,
            settings: <FiSettings size={16} />,
        };
        return icons[actionType] || <FiActivity size={16} />;
    };

    const getActivityColor = (actionType, severity) => {
        if (severity === 'critical') return '#dc2626';
        if (severity === 'warning') return '#f59e0b';
        if (severity === 'error') return '#ef4444';

        const colors = {
            login: '#10b981',
            logout: '#6b7280',
            create: '#10b981',
            update: '#3b82f6',
            delete: '#dc2626',
            approve: '#10b981',
            reject: '#dc2626',
            security: '#8b5cf6',
            mfa: '#2563eb',
        };
        return colors[actionType] || '#6b7280';
    };

    const getActivityTitle = (log) => {
        switch (log.action_type) {
            case 'login':
                return log.success ? 'Successful Login' : 'Failed Login Attempt';
            case 'logout':
                return 'Logout';
            case 'create':
                return `Created ${log.action.split('.')[0]}`;
            case 'update':
                return `Updated ${log.action.split('.')[0]}`;
            case 'delete':
                return `Deleted ${log.action.split('.')[0]}`;
            case 'approve':
                return 'Approved';
            case 'reject':
                return 'Rejected';
            case 'security':
                return 'Security Event';
            case 'mfa':
                return 'MFA Verification';
            default:
                return log.action || 'Activity';
        }
    };

    const getActivityDescription = (log) => {
        if (log.message) return log.message;

        if (log.action_type === 'login') {
            return log.success ? 'Authentication successful' : 'Authentication failed';
        }
        if (log.object_repr) {
            return `${log.action_type} ${log.object_repr}`;
        }
        return `${log.action_type} performed`;
    };

    const filteredActivities = userActivity?.logs?.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'security') return log.severity === 'warning' || log.severity === 'critical' || log.action_type === 'security';
        if (filter === 'login') return log.action_type === 'login' || log.action_type === 'logout';
        if (filter === 'mfa') return log.action.includes('mfa');
        return log.action_type === filter;
    }) || [];

    const displayedActivities = filteredActivities.slice(0, limit);

    if (isLoading) {
        return (
            <div className="activity-timeline-loading">
                <Spinner size="md" />
                <p>Loading activity...</p>
            </div>
        );
    }

    return (
        <div className="activity-timeline">
            {/* Header */}
            {showHeader && (
                <div className="timeline-header">
                    <h3>Activity Timeline</h3>
                    <div className="timeline-filters">
                        <button
                            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-chip ${filter === 'login' ? 'active' : ''}`}
                            onClick={() => setFilter('login')}
                        >
                            <FiLogIn size={12} />
                            Login
                        </button>
                        <button
                            className={`filter-chip ${filter === 'security' ? 'active' : ''}`}
                            onClick={() => setFilter('security')}
                        >
                            <FiShield size={12} />
                            Security
                        </button>
                        <button
                            className={`filter-chip ${filter === 'mfa' ? 'active' : ''}`}
                            onClick={() => setFilter('mfa')}
                        >
                            <FiSmartphone size={12} />
                            MFA
                        </button>
                    </div>
                </div>
            )}

            {/* Timeline Content */}
            {displayedActivities.length === 0 ? (
                <div className="timeline-empty">
                    <FiActivity size={32} />
                    <p>No activity found</p>
                    <span>Your recent activities will appear here</span>
                </div>
            ) : (
                <div className="timeline-items">
                    {displayedActivities.map((log, index) => (
                        <div
                            key={log.id || index}
                            className={`timeline-item ${expandedItem === log.id ? 'expanded' : ''}`}
                            onClick={() => setExpandedItem(expandedItem === log.id ? null : log.id)}
                        >
                            <div className="timeline-marker">
                                <div
                                    className="marker-dot"
                                    style={{ backgroundColor: getActivityColor(log.action_type, log.severity) }}
                                />
                                {index < displayedActivities.length - 1 && <div className="marker-line" />}
                            </div>

                            <div className="timeline-content">
                                <div className="timeline-icon" style={{ color: getActivityColor(log.action_type, log.severity) }}>
                                    {getActivityIcon(log.action_type, log.action)}
                                </div>

                                <div className="timeline-details">
                                    <div className="timeline-title">
                                        <strong>{getActivityTitle(log)}</strong>
                                        {log.severity === 'critical' && (
                                            <span className="severity-badge critical">Critical</span>
                                        )}
                                        {log.severity === 'warning' && (
                                            <span className="severity-badge warning">Warning</span>
                                        )}
                                        {!log.success && log.action_type === 'login' && (
                                            <span className="severity-badge failed">Failed</span>
                                        )}
                                    </div>
                                    <div className="timeline-description">
                                        {getActivityDescription(log)}
                                    </div>
                                    <div className="timeline-meta">
                                        <span className="meta-time">
                                            <FiClock size={12} />
                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                        </span>
                                        {log.ip_address && (
                                            <span className="meta-ip">
                                                <FiShield size={12} />
                                                {log.ip_address}
                                            </span>
                                        )}
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedItem === log.id && (
                                        <div className="timeline-expanded">
                                            {log.changes && Object.keys(log.changes).length > 0 && (
                                                <div className="expanded-section">
                                                    <strong>Changes</strong>
                                                    {Object.entries(log.changes).map(([field, change]) => (
                                                        <div key={field} className="change-item">
                                                            <span className="change-field">{field}</span>
                                                            <span className="change-old">From: {change.old || '—'}</span>
                                                            <span className="change-new">To: {change.new || '—'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {log.user_agent && (
                                                <div className="expanded-section">
                                                    <strong>User Agent</strong>
                                                    <code>{log.user_agent}</code>
                                                </div>
                                            )}
                                            <div className="expanded-footer">
                                                <span>ID: {log.id}</span>
                                                <span>Timestamp: {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityTimeline;