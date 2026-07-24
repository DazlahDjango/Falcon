// frontend/src/components/reports/templates/TemplateDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiCopy,
    FiCheck,
    FiStar,
    FiCalendar,
    FiUser,
    FiTag,
    FiGlobe,
} from 'react-icons/fi';
import { useTemplate } from '../../../hooks/reports';
import { useReportPermissions } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { TemplateStatusBadge } from './TemplateStatusBadge';
import './templates.css';

export const TemplateDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { permissions } = useReportPermissions();

    const {
        template,
        loading,
        error,
        fetchOne,
        remove,
        duplicateTemplate,
        clearErrors,
    } = useTemplate(id, { autoFetch: true });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleBack = () => {
        navigate('/reports/templates');
    };

    const handleEdit = () => {
        navigate(`/reports/templates/${id}/edit`);
    };

    const handleApply = () => {
        navigate(`/reports/templates/${id}/apply`);
    };

    const handleDuplicate = async () => {
        await duplicateTemplate(id);
        navigate('/reports/templates');
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await remove(id);
        navigate('/reports/templates');
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
            departmental: 'Departmental Scorecard',
            kpi: 'KPI Report',
            mission: 'Mission Status Report',
            compliance: 'Compliance Report',
            trend: 'Trend Analysis',
            comparative: 'Comparative Analysis',
            pip: 'PIP Report',
            custom: 'Custom Template',
        };
        return labels[type] || type;
    };

    const getSectorLabel = (sector) => {
        const labels = {
            commercial: 'Commercial/Corporate',
            ngo: 'NGO/Non-Profit',
            public: 'Public Sector',
            consulting: 'Consulting',
            all: 'All Sectors',
        };
        return labels[sector] || sector;
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading template..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load template"
            />
        );
    }

    if (!template) {
        return <ReportError error="Template not found" title="Template not found" />;
    }

    return (
        <div className="template-detail-container">
            <div className="template-detail-header">
                <div className="header-left">
                    <button className="btn btn-outline back-btn" onClick={handleBack}>
                        <FiArrowLeft size={18} />
                        Back to Templates
                    </button>
                    <h1 className="template-title">{template.name}</h1>
                    <TemplateStatusBadge
                        isPublished={template.is_published}
                        isDefault={template.is_default}
                        isSystem={template.is_system}
                    />
                </div>
                <div className="header-right">
                    <button className="btn btn-secondary" onClick={handleApply}>
                        <FiCheck size={16} />
                        Apply
                    </button>
                    <button className="btn btn-secondary" onClick={handleDuplicate}>
                        <FiCopy size={16} />
                        Duplicate
                    </button>
                    {permissions.canEditTemplate && !template.is_system && (
                        <button className="btn btn-secondary" onClick={handleEdit}>
                            <FiEdit2 size={16} />
                            Edit
                        </button>
                    )}
                    {permissions.canDeleteTemplate && !template.is_system && (
                        <button className="btn btn-danger" onClick={handleDelete}>
                            <FiTrash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="template-detail-grid">
                <div className="detail-main">
                    <div className="detail-section">
                        <h3>Template Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Type</span>
                                <span className="info-value">{getTypeLabel(template.template_type)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Sector</span>
                                <span className="info-value">{getSectorLabel(template.sector)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Category</span>
                                <span className="info-value">{template.category || 'Uncategorized'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Version</span>
                                <span className="info-value">v{template.version || 1}</span>
                            </div>
                        </div>
                    </div>

                    {template.description && (
                        <div className="detail-section">
                            <h3>Description</h3>
                            <p className="template-description">{template.description}</p>
                        </div>
                    )}

                    {template.layout_config && (
                        <div className="detail-section">
                            <h3>Layout Configuration</h3>
                            <pre className="config-json">
                                {JSON.stringify(template.layout_config, null, 2)}
                            </pre>
                        </div>
                    )}

                    {template.widget_config && template.widget_config.widgets && (
                        <div className="detail-section">
                            <h3>Widgets ({template.widget_config.widgets.length})</h3>
                            <div className="widgets-list">
                                {template.widget_config.widgets.map((widget, idx) => (
                                    <div key={idx} className="widget-item">
                                        <span className="widget-type">{widget.type}</span>
                                        <span className="widget-title">{widget.title}</span>
                                        <span className="widget-size">
                                            {widget.size?.w}x{widget.size?.h}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                                    {template.owner?.name || template.owner?.email || 'System'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiCalendar size={14} />
                                    Created
                                </span>
                                <span className="info-value">{formatDate(template.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <FiGlobe size={14} />
                                    Sector
                                </span>
                                <span className="info-value">{getSectorLabel(template.sector)}</span>
                            </div>
                            {template.org_size > 0 && (
                                <div className="info-item">
                                    <span className="info-label">Max Org Size</span>
                                    <span className="info-value">{template.org_size}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {template.applicable_industries && template.applicable_industries.length > 0 && (
                        <div className="detail-section">
                            <h3>
                                <FiTag size={14} />
                                Applicable Industries
                            </h3>
                            <div className="industries-list">
                                {template.applicable_industries.map((industry, idx) => (
                                    <span key={idx} className="industry-tag">{industry}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>Features</h3>
                        <div className="features-list">
                            <div className="feature-item">
                                <span className="feature-icon">{template.has_prebuilt_charts ? '✅' : '❌'}</span>
                                <span className="feature-label">Prebuilt Charts</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">{template.has_dynamic_filters ? '✅' : '❌'}</span>
                                <span className="feature-label">Dynamic Filters</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">{template.has_parameters ? '✅' : '❌'}</span>
                                <span className="feature-label">Parameters</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">{template.is_popular ? '⭐' : '📄'}</span>
                                <span className="feature-label">{template.is_popular ? 'Popular' : 'Standard'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Template"
                message={`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};