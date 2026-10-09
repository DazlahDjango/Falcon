// frontend/src/components/reports/templates/TemplatePrebuilt.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiCheck, FiStar } from 'react-icons/fi';
import { ReportLoading } from '../common';
import { REPORT_TYPE_LABELS } from '../../../config/constants/reportConstants';
import './templates.css';

export const TemplatePrebuilt = ({
    templates = [],
    loading = false,
    onApply,
    onView,
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const getTypeLabel = (type, typeDisplay) => {
        if (typeDisplay) return typeDisplay;
        return REPORT_TYPE_LABELS[type] || type || 'Custom Template';
    };

    const getSectorLabel = (sec, secDisplay) => {
        if (secDisplay) return secDisplay;
        if (typeof sec === 'object' && sec) {
            return sec.name ? `${sec.name}${sec.sector_type ? ` (${sec.sector_type})` : ''}` : sec.code || 'All Sectors';
        }
        return sec || 'All Sectors';
    };

    if (loading) {
        return <ReportLoading variant="spinner" text="Loading prebuilt templates..." />;
    }

    if (templates.length === 0) {
        return (
            <div className="prebuilt-empty">
                <span className="empty-icon">📋</span>
                <p>No prebuilt templates available</p>
                <span className="empty-hint">Prebuilt templates will be loaded automatically</span>
            </div>
        );
    }

    return (
        <div className="prebuilt-container">
            <div className="prebuilt-header">
                <h3>Prebuilt Templates</h3>
                <span className="prebuilt-count">{templates.length} templates available</span>
            </div>
            <div className="prebuilt-grid">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className={`prebuilt-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTemplate(template.id)}
                    >
                        <div className="prebuilt-card-header">
                            <span className="prebuilt-type">{getTypeLabel(template.template_type, template.template_type_display)}</span>
                            {template.is_popular && (
                                <span className="popular-badge">
                                    <FiStar size={12} />
                                    Popular
                                </span>
                            )}
                        </div>
                        <div className="prebuilt-card-body">
                            <h4 className="prebuilt-name">{template.name}</h4>
                            {template.description && (
                                <p className="prebuilt-description">{template.description}</p>
                            )}
                            <div className="prebuilt-meta">
                                <span className="meta-item">
                                    <span className="meta-label">Sector:</span>
                                    <span className="meta-value">{getSectorLabel(template.sector, template.sector_display)}</span>
                                </span>
                                <span className="meta-item">
                                    <span className="meta-label">Version:</span>
                                    <span className="meta-value">v{template.version || 1}</span>
                                </span>
                            </div>
                        </div>
                        <div className="prebuilt-card-actions">
                            <button
                                className="action-btn view"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView?.(template.id);
                                }}
                                title="View Template"
                            >
                                <FiEye size={16} />
                            </button>
                            <button
                                className="action-btn apply"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onApply?.(template.id);
                                }}
                                title="Apply Template"
                            >
                                <FiCheck size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

TemplatePrebuilt.propTypes = {
    templates: PropTypes.array,
    loading: PropTypes.bool,
    onApply: PropTypes.func,
    onView: PropTypes.func,
};