// frontend/src/components/reports/templates/TemplatePrebuilt.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiCheck, FiStar } from 'react-icons/fi';
import { ReportLoading } from '../common';
import './templates.css';

export const TemplatePrebuilt = ({
    templates = [],
    loading = false,
    onApply,
    onView,
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const getTypeLabel = (type) => {
        const labels = {
            executive: 'Executive Dashboard',
            departmental: 'Departmental Scorecard',
            kpi: 'KPI Report',
            mission: 'Mission Status',
            compliance: 'Compliance',
            trend: 'Trend Analysis',
            comparative: 'Comparative',
            pip: 'PIP Report',
            custom: 'Custom Template',
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
                            <span className="prebuilt-type">{getTypeLabel(template.template_type)}</span>
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
                                    <span className="meta-value">{getSectorLabel(template.sector)}</span>
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