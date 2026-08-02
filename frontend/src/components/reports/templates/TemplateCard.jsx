// frontend/src/components/reports/templates/TemplateCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiCopy, FiCheck, FiStar } from 'react-icons/fi';
import { REPORT_TYPE_ICONS, REPORT_TYPE_LABELS } from '../../../config/constants/reportConstants';
import { TemplateStatusBadge } from './TemplateStatusBadge';
import './templates.css';

export const TemplateCard = ({
    template,
    onView,
    onEdit,
    onDelete,
    onDuplicate,
    onApply,
    className = '',
}) => {
    const {
        id,
        name,
        description,
        template_type,
        sector,
        is_system,
        is_published,
        is_default,
        is_popular,
        version,
        created_at,
    } = template || {};

    const getTypeIcon = (type) => REPORT_TYPE_ICONS[type] || '📄';
    const getTypeLabel = (type) => REPORT_TYPE_LABELS[type] || type;

    const getSectorLabel = (sector) => {
        const labels = {
            commercial: 'Commercial',
            ngo: 'NGO',
            public: 'Public',
            consulting: 'Consulting',
            all: 'All Sectors',
        };
        return labels[sector] || sector;
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
        <div className={`template-card ${className} ${is_system ? 'system' : ''}`}>
            <div className="template-card-header">
                <div className="template-card-type">
                    <span className="type-icon">{getTypeIcon(template_type)}</span>
                    <span className="type-label">{getTypeLabel(template_type)}</span>
                </div>
                <TemplateStatusBadge
                    isPublished={is_published}
                    isDefault={is_default}
                    isSystem={is_system}
                    size="small"
                />
            </div>
            <div className="template-card-body">
                <h3 className="template-card-title">
                    <Link to={`/reports/templates/${id}`}>{name}</Link>
                </h3>
                {description && (
                    <p className="template-card-description">{description}</p>
                )}
                <div className="template-card-meta">
                    <span className="meta-item">
                        <span className="meta-label">Sector:</span>
                        <span className="meta-value">{getSectorLabel(sector)}</span>
                    </span>
                    {is_popular && (
                        <span className="popular-badge">⭐ Popular</span>
                    )}
                    <span className="meta-item">
                        <span className="meta-label">Version:</span>
                        <span className="meta-value">v{version || 1}</span>
                    </span>
                    <span className="meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">{formatDate(created_at)}</span>
                    </span>
                </div>
            </div>
            <div className="template-card-actions">
                <button
                    className="action-btn view"
                    onClick={() => onView?.(id)}
                    title="View Template"
                >
                    <FiEye size={16} />
                </button>
                <button
                    className="action-btn apply"
                    onClick={() => onApply?.(id)}
                    title="Apply Template"
                >
                    <FiCheck size={16} />
                </button>
                <button
                    className="action-btn duplicate"
                    onClick={() => onDuplicate?.(id)}
                    title="Duplicate Template"
                >
                    <FiCopy size={16} />
                </button>
                <button
                    className="action-btn edit"
                    onClick={() => onEdit?.(id)}
                    title="Edit Template"
                >
                    <FiEdit2 size={16} />
                </button>
                <button
                    className="action-btn delete"
                    onClick={() => onDelete?.(template)}
                    title="Delete Template"
                    disabled={is_system}
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
        </div>
    );
};

TemplateCard.propTypes = {
    template: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        template_type: PropTypes.string,
        sector: PropTypes.string,
        is_system: PropTypes.bool,
        is_published: PropTypes.bool,
        is_default: PropTypes.bool,
        is_popular: PropTypes.bool,
        version: PropTypes.number,
        created_at: PropTypes.string,
    }).isRequired,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onDuplicate: PropTypes.func,
    onApply: PropTypes.func,
    className: PropTypes.string,
};