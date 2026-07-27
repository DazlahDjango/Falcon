// frontend/src/components/reports/common/ReportCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ReportStatusBadge } from './ReportStatusBadge';
import './common.css';

export const ReportCard = ({
    report,
    onGenerate,
    onExport,
    onEdit,
    onDelete,
    showActions = true,
    className = '',
}) => {
    const {
        id,
        name,
        description,
        report_type,
        status,
        category,
        last_generated_at,
        owner,
        is_published,
        is_archived,
    } = report || {};

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTypeIcon = (type) => {
        const icons = {
            kpi: '📊',
            departmental: '🏢',
            executive: '👔',
            compliance: '✅',
            trend: '📈',
            comparative: '⚖️',
            mission: '🎯',
            pip: '📋',
            custom: '⚙️',
        };
        return icons[type] || '📄';
    };

    const getTypeLabel = (type) => {
        const labels = {
            kpi: 'KPI Report',
            departmental: 'Departmental',
            executive: 'Executive',
            compliance: 'Compliance',
            trend: 'Trend Analysis',
            comparative: 'Comparative',
            mission: 'Mission Status',
            pip: 'PIP Tracking',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

    return (
        <div className={`report-card ${className} ${is_archived ? 'archived' : ''}`}>
            <div className="report-card-header">
                <div className="report-card-type">
                    <span className="type-icon">{getTypeIcon(report_type)}</span>
                    <span className="type-label">{getTypeLabel(report_type)}</span>
                </div>
                <ReportStatusBadge status={status} />
            </div>
            <div className="report-card-body">
                <h3 className="report-card-title">
                    <Link to={`/reports/${id}`}>{name}</Link>
                </h3>
                {description && (
                    <p className="report-card-description">{description}</p>
                )}
                <div className="report-card-meta">
                    <span className="meta-item">
                        <span className="meta-label">Category:</span>
                        <span className="meta-value">{category || 'Uncategorized'}</span>
                    </span>
                    {owner && (
                        <span className="meta-item">
                            <span className="meta-label">Owner:</span>
                            <span className="meta-value">{owner?.name || owner?.email || 'Unknown'}</span>
                        </span>
                    )}
                    <span className="meta-item">
                        <span className="meta-label">Last Generated:</span>
                        <span className="meta-value">{formatDate(last_generated_at)}</span>
                    </span>
                    {is_published && (
                        <span className="meta-item published-badge">Published</span>
                    )}
                </div>
            </div>
            {showActions && (
                <div className="report-card-actions">
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onGenerate?.(id)}
                        disabled={status === 'generating'}
                    >
                        {status === 'generating' ? 'Generating...' : 'Generate'}
                    </button>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onExport?.(id)}
                    >
                        Export
                    </button>
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onEdit?.(id)}
                    >
                        Edit
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete?.(id)}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

ReportCard.propTypes = {
    report: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        report_type: PropTypes.string,
        status: PropTypes.string,
        category: PropTypes.string,
        last_generated_at: PropTypes.string,
        owner: PropTypes.object,
        is_published: PropTypes.bool,
        is_archived: PropTypes.bool,
    }).isRequired,
    onGenerate: PropTypes.func,
    onExport: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    showActions: PropTypes.bool,
    className: PropTypes.string,
};