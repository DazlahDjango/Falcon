// frontend/src/components/reports/dashboards/DashboardTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEdit2, FiTrash2, FiShare2, FiStar } from 'react-icons/fi';
import { DashboardStatusBadge } from './DashboardStatusBadge';
import './dashboards.css';

export const DashboardTable = ({
    dashboards = [],
    onView,
    onEdit,
    onDelete,
}) => {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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

    return (
        <div className="dashboard-table-container">
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {dashboards.map((dashboard) => (
                        <tr key={dashboard.id}>
                            <td>
                                <div className="dashboard-name-cell">
                                    <span className="dashboard-name">{dashboard.name}</span>
                                    {dashboard.is_default && (
                                        <span className="default-badge">
                                            <FiStar size={12} />
                                            Default
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td>
                                <span className="dashboard-type-badge">{getTypeLabel(dashboard.dashboard_type)}</span>
                            </td>
                            <td>
                                <DashboardStatusBadge
                                    isPublished={dashboard.is_published}
                                    isShared={dashboard.is_shared}
                                    size="small"
                                />
                            </td>
                            <td>{dashboard.view_count || 0}</td>
                            <td>{formatDate(dashboard.created_at)}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn view"
                                        onClick={() => onView?.(dashboard.id)}
                                        title="View Dashboard"
                                    >
                                        <FiEye size={16} />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        onClick={() => onEdit?.(dashboard.id)}
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

DashboardTable.propTypes = {
    dashboards: PropTypes.array,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};