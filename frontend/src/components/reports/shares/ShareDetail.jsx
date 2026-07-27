// frontend/src/components/reports/shares/ShareDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiTrash2,
    FiUser,
    FiClock,
    FiGlobe,
    FiLink,
    FiMail,
    FiLock,
} from 'react-icons/fi';
import { useShare } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { ShareStatusBadge } from './ShareStatusBadge';
import { ShareLink } from './ShareLink';
import { SharePermissions } from './SharePermissions';
import './shares.css';

export const ShareDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        share,
        loading,
        error,
        fetchOne,
        remove,
        deactivate,
        activate,
        clearErrors,
    } = useShare(id, { autoFetch: true });

    const handleBack = () => {
        navigate('/reports/shares');
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await remove(id);
        navigate('/reports/shares');
    };

    const handleToggleActive = async () => {
        if (share?.is_active) {
            await deactivate(id);
        } else {
            await activate(id);
        }
        await fetchOne(id);
    };

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
            internal: 'Internal Share',
            external: 'External Share',
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

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading share..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load share"
            />
        );
    }

    if (!share) {
        return <ReportError error="Share not found" title="Share not found" />;
    }

    return (
        <div className="share-detail-container">
            <div className="share-detail-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Shares
                </button>
                <h1 className="page-title">Share Details</h1>
                <ShareStatusBadge
                    isActive={share.is_active}
                    isExpired={share.expires_at && new Date(share.expires_at) < new Date()}
                    size="large"
                />
            </div>

            <div className="share-detail-grid">
                <div className="detail-main">
                    <div className="detail-section">
                        <h3>Share Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Report</span>
                                <span className="info-value">
                                    {share.report_name || share.report || 'Unknown'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiUser size={14} />
                                    Shared By
                                </span>
                                <span className="info-value">
                                    {share.shared_by?.name || share.shared_by?.email || 'Unknown'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiUser size={14} />
                                    Shared With
                                </span>
                                <span className="info-value">
                                    {share.shared_with?.name || share.shared_with?.email || 'Public'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiGlobe size={14} />
                                    Share Type
                                </span>
                                <span className="info-value">{getShareTypeLabel(share.share_type)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Permission</span>
                                <span className="info-value">{getPermissionLabel(share.permission)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiClock size={14} />
                                    Expires
                                </span>
                                <span className="info-value">
                                    {share.expires_at ? formatDate(share.expires_at) : 'Never'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Access Count</span>
                                <span className="info-value">{share.access_count || 0}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Last Accessed</span>
                                <span className="info-value">
                                    {share.last_accessed_at ? formatDate(share.last_accessed_at) : 'Never'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {share.message && (
                        <div className="detail-section">
                            <h3>
                                <FiMail size={14} />
                                Message
                            </h3>
                            <p className="share-message">{share.message}</p>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>
                            <FiLink size={14} />
                            Share Link
                        </h3>
                        <ShareLink
                            shareId={share.id}
                            link={share.share_link}
                            token={share.share_token}
                            variant="full"
                        />
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="detail-section actions-section">
                        <h3>Actions</h3>
                        <div className="action-buttons-vertical">
                            <button
                                className={`btn ${share.is_active ? 'btn-warning' : 'btn-success'} full-width`}
                                onClick={handleToggleActive}
                                disabled={share.expires_at && new Date(share.expires_at) < new Date()}
                            >
                                {share.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                className="btn btn-danger full-width"
                                onClick={handleDelete}
                            >
                                <FiTrash2 size={16} />
                                Delete Share
                            </button>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Security</h3>
                        <div className="info-grid single">
                            <div className="info-item">
                                <span className="info-label">
                                    <FiLock size={14} />
                                    Password Protected
                                </span>
                                <span className="info-value">
                                    {share.password_protected ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Include Attachments</span>
                                <span className="info-value">
                                    {share.include_attachments ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Notify Recipient</span>
                                <span className="info-value">
                                    {share.notify_recipient ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Permissions</h3>
                        <SharePermissions
                            permission={share.permission}
                            showLabel={true}
                            size="medium"
                        />
                    </div>

                    <div className="detail-section">
                        <h3>Metadata</h3>
                        <div className="info-grid single">
                            <div className="info-item">
                                <span className="info-label">Created</span>
                                <span className="info-value">{formatDate(share.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Updated</span>
                                <span className="info-value">{formatDate(share.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Share"
                message={`Are you sure you want to delete this share? The share link will no longer work.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};