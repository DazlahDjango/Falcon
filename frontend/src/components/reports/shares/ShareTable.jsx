// frontend/src/components/reports/shares/ShareTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiTrash2, FiLink, FiCopy } from 'react-icons/fi';
import { ShareStatusBadge } from './ShareStatusBadge';
import { ShareLink } from './ShareLink';
import './shares.css';

export const ShareTable = ({ shares = [], onView, onDelete }) => {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getShareTypeLabel = (type) => {
        const labels = {
            internal: 'Internal',
            external: 'External',
            public: 'Public Link',
        };
        return labels[type] || type;
    };

    const getPermissionLabel = (permission) => {
        const labels = {
            view: 'View Only',
            comment: 'View & Comment',
            edit: 'View, Comment & Edit',
            export: 'View, Comment, Edit & Export',
        };
        return labels[permission] || permission;
    };

    return (
        <div className="share-table-container">
            <table className="share-table">
                <thead>
                    <tr>
                        <th>Report</th>
                        <th>Shared With</th>
                        <th>Type</th>
                        <th>Permission</th>
                        <th>Status</th>
                        <th>Expires</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {shares.map((share) => (
                        <tr key={share.id}>
                            <td>
                                <span className="report-name">{share.report_name || share.report}</span>
                            </td>
                            <td>
                                <span className="shared-with">
                                    {share.shared_with?.name || share.shared_with?.email || 'Unknown'}
                                </span>
                            </td>
                            <td>
                                <span className="share-type-badge">{getShareTypeLabel(share.share_type)}</span>
                            </td>
                            <td>
                                <span className="permission-badge">{getPermissionLabel(share.permission)}</span>
                            </td>
                            <td>
                                <ShareStatusBadge
                                    isActive={share.is_active}
                                    isExpired={share.expires_at && new Date(share.expires_at) < new Date()}
                                    size="small"
                                />
                            </td>
                            <td>{share.expires_at ? formatDate(share.expires_at) : 'Never'}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn view"
                                        onClick={() => onView?.(share.id)}
                                        title="View Details"
                                    >
                                        <FiEye size={16} />
                                    </button>
                                    {share.share_link && (
                                        <ShareLink
                                            shareId={share.id}
                                            link={share.share_link}
                                            token={share.share_token}
                                            variant="icon"
                                        />
                                    )}
                                    <button
                                        className="action-btn delete"
                                        onClick={() => onDelete?.(share)}
                                        title="Delete Share"
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

ShareTable.propTypes = {
    shares: PropTypes.array,
    onView: PropTypes.func,
    onDelete: PropTypes.func,
};