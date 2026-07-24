// frontend/src/components/reports/templates/TemplateTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEdit2, FiTrash2, FiCopy, FiCheck, FiStar } from 'react-icons/fi';
import { TemplateStatusBadge } from './TemplateStatusBadge';
import './templates.css';

export const TemplateTable = ({
    templates = [],
    onView,
    onEdit,
    onDelete,
    onDuplicate,
    onApply,
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
            kpi: 'KPI',
            mission: 'Mission',
            compliance: 'Compliance',
            trend: 'Trend',
            comparative: 'Comparative',
            pip: 'PIP',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

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

    return (
        <div className="template-table-container">
            <table className="template-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Sector</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {templates.map((template) => (
                        <tr key={template.id}>
                            <td>
                                <div className="template-name-cell">
                                    <span className="template-name">{template.name}</span>
                                    {template.is_default && (
                                        <span className="default-badge">
                                            <FiStar size={12} />
                                            Default
                                        </span>
                                    )}
                                    {template.is_system && (
                                        <span className="system-badge">System</span>
                                    )}
                                </div>
                            </td>
                            <td>
                                <span className="template-type-badge">{getTypeLabel(template.template_type)}</span>
                            </td>
                            <td>{getSectorLabel(template.sector)}</td>
                            <td>
                                <TemplateStatusBadge
                                    isPublished={template.is_published}
                                    isDefault={template.is_default}
                                    isSystem={template.is_system}
                                    size="small"
                                />
                            </td>
                            <td>{formatDate(template.created_at)}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn view"
                                        onClick={() => onView?.(template.id)}
                                        title="View Template"
                                    >
                                        <FiEye size={16} />
                                    </button>
                                    <button
                                        className="action-btn apply"
                                        onClick={() => onApply?.(template.id)}
                                        title="Apply Template"
                                    >
                                        <FiCheck size={16} />
                                    </button>
                                    <button
                                        className="action-btn duplicate"
                                        onClick={() => onDuplicate?.(template.id)}
                                        title="Duplicate Template"
                                    >
                                        <FiCopy size={16} />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        onClick={() => onEdit?.(template.id)}
                                        title="Edit Template"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => onDelete?.(template)}
                                        title="Delete Template"
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

TemplateTable.propTypes = {
    templates: PropTypes.array,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onDuplicate: PropTypes.func,
    onApply: PropTypes.func,
};