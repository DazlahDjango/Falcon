// frontend/src/components/reports/dashboards/DashboardDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiShare2,
    FiStar,
    FiEye,
    FiUser,
    FiCalendar,
    FiRefreshCw,
} from 'react-icons/fi';
import { useDashboard } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { DashboardStatusBadge } from './DashboardStatusBadge';
import { DashboardView } from './DashboardView';
import './dashboards.css';

export const DashboardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();

    const {
        dashboard,
        loading,
        error,
        fetchOne,
        remove,
        refreshDashboard,
        clearErrors,
    } = useDashboard(id, { autoFetch: true });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleBack = () => {
        navigate('/reports/dashboards');
    };

    const handleEdit = () => {
        navigate(`/reports/dashboards/${id}/edit`);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await remove(id);
        navigate('/reports/dashboards');
    };

    const handleRefresh = async () => {
        await refreshDashboard(id);
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

    const getTypeLabel = (type) => {
        const labels = {
            executive: 'Executive Dashboard',
            departmental: 'Departmental Dashboard',
            team: 'Team Dashboard',
            personal: 'Personal Dashboard',
            custom: 'Custom Dashboard',
        };
        return labels[type] || type;
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading dashboard..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load dashboard"
            />
        );
    }

    if (!dashboard) {
        return <ReportError error="Dashboard not found" title="Dashboard not found" />;
    }

    return (
        <div className="dashboard-detail-container">
            <div className="dashboard-detail-header">
                <div className="header-left">
                    <button className="btn btn-outline back-btn" onClick={handleBack}>
                        <FiArrowLeft size={18} />
                        Back to Dashboards
                    </button>
                    <h1 className="dashboard-title">{dashboard.name}</h1>
                    <DashboardStatusBadge
                        isPublished={dashboard.is_published}
                        isShared={dashboard.is_shared}
                    />
                    {dashboard.is_default && (
                        <span className="default-badge">⭐ Default</span>
                    )}
                </div>
                <div className="header-right">
                    <button className="btn btn-secondary" onClick={handleRefresh}>
                        <FiRefreshCw size={16} />
                        Refresh
                    </button>
                    {permissions.canEditDashboard && (
                        <button className="btn btn-secondary" onClick={handleEdit}>
                            <FiEdit2 size={16} />
                            Edit
                        </button>
                    )}
                    {permissions.canDeleteDashboard && (
                        <button className="btn btn-danger" onClick={handleDelete}>
                            <FiTrash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="dashboard-detail-grid">
                <div className="detail-main">
                    <div className="detail-section">
                        <h3>Dashboard Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Type</span>
                                <span className="info-value">{getTypeLabel(dashboard.dashboard_type)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Status</span>
                                <span className="info-value">
                                    <DashboardStatusBadge
                                        isPublished={dashboard.is_published}
                                        isShared={dashboard.is_shared}
                                        size="medium"
                                    />
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiEye size={14} />
                                    Views
                                </span>
                                <span className="info-value">{dashboard.view_count || 0}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Default</span>
                                <span className="info-value">{dashboard.is_default ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Refresh Interval</span>
                                <span className="info-value">{dashboard.refresh_interval || 300}s</span>
                            </div>
                        </div>
                    </div>

                    {dashboard.description && (
                        <div className="detail-section">
                            <h3>Description</h3>
                            <p className="dashboard-description">{dashboard.description}</p>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>Dashboard Preview</h3>
                        <DashboardView dashboard={dashboard} preview />
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="detail-section">
                        <h3>Metadata</h3>
                        <div className="info-grid single">
                            <div className="info-item">
                                <span className="info-label">
                                    <FiUser size={14} />
                                    Owner
                                </span>
                                <span className="info-value">
                                    {dashboard.owner?.name || dashboard.owner?.email || 'Unknown'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiCalendar size={14} />
                                    Created
                                </span>
                                <span className="info-value">{formatDate(dashboard.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiCalendar size={14} />
                                    Last Viewed
                                </span>
                                <span className="info-value">{formatDate(dashboard.last_viewed_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Widgets</span>
                                <span className="info-value">
                                    {dashboard.widgets?.filter(w => w.is_active).length || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {dashboard.tags && dashboard.tags.length > 0 && (
                        <div className="detail-section">
                            <h3>Tags</h3>
                            <div className="tags-container">
                                {dashboard.tags.map((tag, idx) => (
                                    <span key={idx} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {dashboard.is_shared && (
                        <div className="detail-section">
                            <h3>
                                <FiShare2 size={14} />
                                Sharing
                            </h3>
                            <div className="sharing-info">
                                <div className="info-item">
                                    <span className="info-label">Shared</span>
                                    <span className="info-value">Yes</span>
                                </div>
                                {dashboard.allowed_roles && dashboard.allowed_roles.length > 0 && (
                                    <div className="info-item">
                                        <span className="info-label">Allowed Roles</span>
                                        <span className="info-value">
                                            {dashboard.allowed_roles.join(', ')}
                                        </span>
                                    </div>
                                )}
                                {dashboard.allowed_departments && dashboard.allowed_departments.length > 0 && (
                                    <div className="info-item">
                                        <span className="info-label">Allowed Departments</span>
                                        <span className="info-value">
                                            {dashboard.allowed_departments.join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Dashboard"
                message={`Are you sure you want to delete the dashboard "${dashboard.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};