// frontend/src/components/reports/dashboards/DashboardCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiShare2, FiStar } from 'react-icons/fi';
import { DashboardStatusBadge } from './DashboardStatusBadge';
import './dashboards.css';

export const DashboardCard = ({
    dashboard,
    onView,
    onEdit,
    onDelete,
    className = '',
}) => {
    const {
        id,
        name,
        description,
        dashboard_type,
        is_default,
        is_shared,
        is_published,
        view_count,
        created_at,
        owner,
    } = dashboard || {};

    const getTypeIcon = (type) => {
        const icons = {
            executive: '👔',
            departmental: '🏢',
            team: '👥',
            personal: '👤',
            custom: '⚙️',
        };
        return icons[type] || '📊';
    };

    const getTypeLabel = (type) => {
        const labels = {
            executive: 'Executive',
            departmental: 'Departmental',
            team: 'Team',
            personal: 'Personal',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className={`dashboard-card ${className}`}>
            <div className="dashboard-card-header">
                <div className="dashboard-card-type">
                    <span className="type-icon">{getTypeIcon(dashboard_type)}</span>
                    <span className="type-label">{getTypeLabel(dashboard_type)}</span>
                </div>
                <DashboardStatusBadge
                    isPublished={is_published}
                    isShared={is_shared}
                    size="small"
                />
            </div>
            <div className="dashboard-card-body">
                <h3 className="dashboard-card-title">
                    <Link to={`/reports/dashboards/${id}`}>{name}</Link>
                </h3>
                {description && (
                    <p className="dashboard-card-description">{description}</p>
                )}
                <div className="dashboard-card-meta">
                    {is_default && (
                        <span className="default-badge">
                            <FiStar size={12} />
                            Default
                        </span>
                    )}
                    <span className="meta-item">
                        <span className="meta-label">Views:</span>
                        <span className="meta-value">{view_count || 0}</span>
                    </span>
                    {owner && (
                        <span className="meta-item">
                            <span className="meta-label">Owner:</span>
                            <span className="meta-value">{owner?.name || owner?.email || 'Unknown'}</span>
                        </span>
                    )}
                    <span className="meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">{formatDate(created_at)}</span>
                    </span>
                </div>
            </div>
            <div className="dashboard-card-actions">
                <button
                    className="action-btn view"
                    onClick={() => onView?.(id)}
                    title="View Dashboard"
                >
                    <FiEye size={16} />
                </button>
                <button
                    className="action-btn edit"
                    onClick={() => onEdit?.(id)}
                    title="Edit Dashboard"
                >
                    <FiEdit2 size={16} />
                </button>
                <button
                    className="action-btn delete"
                    onClick={() => onDelete?.(dashboard)}
                    title="Delete Dashboard"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
        </div>
    );
};

DashboardCard.propTypes = {
    dashboard: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        dashboard_type: PropTypes.string,
        is_default: PropTypes.bool,
        is_shared: PropTypes.bool,
        is_published: PropTypes.bool,
        view_count: PropTypes.number,
        created_at: PropTypes.string,
        owner: PropTypes.object,
    }).isRequired,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    className: PropTypes.string,
};