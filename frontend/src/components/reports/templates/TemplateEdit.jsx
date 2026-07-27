// frontend/src/components/reports/templates/TemplateEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useTemplate } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import './templates.css';

export const TemplateEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        template,
        loading,
        error,
        fetchOne,
        update,
        clearErrors,
    } = useTemplate(id, { autoFetch: true });

    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name || '',
                description: template.description || '',
                template_type: template.template_type || 'custom',
                category: template.category || '',
                sector: template.sector || 'all',
                department: template.department || '',
                layout_config: template.layout_config || { grid_columns: 12, row_height: 100, spacing: 10, sections: ['overview'] },
                widget_config: template.widget_config || { widgets: [] },
                filter_config: template.filter_config || { filters: [] },
                parameter_config: template.parameter_config || { parameters: [] },
                chart_config: template.chart_config || { default_chart_type: 'bar', colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'], show_legend: true, show_tooltip: true },
                table_config: template.table_config || { responsive: true, striped: true, bordered: true, hover: true, sortable: true },
                style_config: template.style_config || { theme: 'light', font_family: 'Arial', primary_color: '#2563eb' },
                export_config: template.export_config || { formats: ['pdf', 'excel'], page_size: 'A4', orientation: 'portrait' },
                applicable_industries: template.applicable_industries || [],
                org_size: template.org_size || 0,
                is_published: template.is_published || false,
                is_default: template.is_default || false,
                is_popular: template.is_popular || false,
            });
        }
    }, [template]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleConfigChange = (configName, value) => {
        setFormData((prev) => ({
            ...prev,
            [configName]: { ...prev[configName], ...value },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData) return;
        setIsSubmitting(true);
        try {
            await update(id, formData);
            navigate(`/reports/templates/${id}`);
        } catch (err) {
            console.error('Failed to update template:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (hasChanges()) {
            setShowCancelConfirm(true);
        } else {
            navigate(`/reports/templates/${id}`);
        }
    };

    const hasChanges = () => {
        if (!template || !formData) return false;
        return JSON.stringify(template) !== JSON.stringify({ ...template, ...formData });
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

    if (!template || !formData) {
        return <ReportError error="Template not found" title="Template not found" />;
    }

    if (template.is_system) {
        return (
            <div className="template-system-notice">
                <span className="notice-icon">🔒</span>
                <h2>System Template</h2>
                <p>This template is system-managed and cannot be edited. You can duplicate it to create a custom version.</p>
                <button className="btn btn-primary" onClick={() => navigate(`/reports/templates/${id}/apply`)}>
                    Apply Template
                </button>
                <button className="btn btn-secondary" onClick={handleBack}>
                    Go Back
                </button>
            </div>
        );
    }

    const templateTypes = [
        { value: 'executive', label: 'Executive Dashboard' },
        { value: 'departmental', label: 'Departmental Scorecard' },
        { value: 'kpi', label: 'KPI Report' },
        { value: 'mission', label: 'Mission Status Report' },
        { value: 'compliance', label: 'Compliance Report' },
        { value: 'trend', label: 'Trend Analysis' },
        { value: 'comparative', label: 'Comparative Analysis' },
        { value: 'pip', label: 'PIP Report' },
        { value: 'custom', label: 'Custom Template' },
    ];

    const sectors = [
        { value: 'commercial', label: 'Commercial/Corporate' },
        { value: 'ngo', label: 'NGO/Non-Profit' },
        { value: 'public', label: 'Public Sector' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'all', label: 'All Sectors' },
    ];

    return (
        <div className="template-form-container">
            <div className="template-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Edit Template: {template.name}</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim()}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="template-tabs">
                <button
                    className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                >
                    Basic Info
                </button>
                <button
                    className={`tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
                    onClick={() => setActiveTab('layout')}
                >
                    Layout & Widgets
                </button>
                <button
                    className={`tab-btn ${activeTab === 'filters' ? 'active' : ''}`}
                    onClick={() => setActiveTab('filters')}
                >
                    Filters & Parameters
                </button>
                <button
                    className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advanced')}
                >
                    Advanced
                </button>
            </div>

            <form className="template-form" onSubmit={handleSubmit}>
                {activeTab === 'basic' && (
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="name">Template Name *</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Enter template name"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Enter template description"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="template_type">Template Type</label>
                                <input
                                    id="template_type"
                                    type="text"
                                    value={template.template_type}
                                    disabled
                                    className="disabled-input"
                                />
                                <small className="helper-text">Template type cannot be changed</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="sector">Sector</label>
                                <select
                                    id="sector"
                                    value={formData.sector}
                                    onChange={(e) => handleChange('sector', e.target.value)}
                                >
                                    {sectors.map((sector) => (
                                        <option key={sector.value} value={sector.value}>
                                            {sector.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <input
                                    id="category"
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    placeholder="e.g., Financial, HR, Operational"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <input
                                    id="department"
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    placeholder="e.g., Sales, Marketing, Engineering"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="org_size">Max Organization Size</label>
                                <input
                                    id="org_size"
                                    type="number"
                                    value={formData.org_size}
                                    onChange={(e) => handleChange('org_size', parseInt(e.target.value) || 0)}
                                    min="0"
                                    placeholder="0 = no limit"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_published}
                                        onChange={(e) => handleChange('is_published', e.target.checked)}
                                    />
                                    Published
                                </label>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_default}
                                        onChange={(e) => handleChange('is_default', e.target.checked)}
                                    />
                                    Default Template
                                </label>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_popular}
                                        onChange={(e) => handleChange('is_popular', e.target.checked)}
                                    />
                                    Mark as Popular
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'layout' && (
                    <div className="form-section">
                        <h3 className="section-title">Layout Configuration</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="grid_columns">Grid Columns</label>
                                <input
                                    id="grid_columns"
                                    type="number"
                                    value={formData.layout_config.grid_columns}
                                    onChange={(e) =>
                                        handleConfigChange('layout_config', {
                                            grid_columns: parseInt(e.target.value) || 12,
                                        })
                                    }
                                    min="1"
                                    max="24"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="row_height">Row Height</label>
                                <input
                                    id="row_height"
                                    type="number"
                                    value={formData.layout_config.row_height}
                                    onChange={(e) =>
                                        handleConfigChange('layout_config', {
                                            row_height: parseInt(e.target.value) || 100,
                                        })
                                    }
                                    min="20"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="spacing">Spacing</label>
                                <input
                                    id="spacing"
                                    type="number"
                                    value={formData.layout_config.spacing}
                                    onChange={(e) =>
                                        handleConfigChange('layout_config', {
                                            spacing: parseInt(e.target.value) || 10,
                                        })
                                    }
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="sections">Sections (comma separated)</label>
                                <input
                                    id="sections"
                                    type="text"
                                    value={formData.layout_config.sections?.join(', ') || ''}
                                    onChange={(e) =>
                                        handleConfigChange('layout_config', {
                                            sections: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                                        })
                                    }
                                    placeholder="overview, performance, details"
                                />
                            </div>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 24 }}>
                            Widgets ({formData.widget_config.widgets.length})
                        </h3>
                        <div className="widgets-config-list">
                            {formData.widget_config.widgets.map((widget, index) => (
                                <div key={index} className="widget-config-item">
                                    <div className="widget-config-row">
                                        <span className="widget-index">#{index + 1}</span>
                                        <span className="widget-type-display">{widget.type}</span>
                                        <span className="widget-title-display">{widget.title || 'Untitled'}</span>
                                        <span className="widget-size-display">
                                            {widget.size?.w || 4}x{widget.size?.h || 3}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                const newWidgets = formData.widget_config.widgets.filter((_, i) => i !== index);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    widget_config: { ...prev.widget_config, widgets: newWidgets },
                                                }));
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <small className="helper-text">Edit widgets in the advanced configuration or use the API</small>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 24 }}>
                            Style Configuration
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="theme">Theme</label>
                                <select
                                    id="theme"
                                    value={formData.style_config.theme}
                                    onChange={(e) =>
                                        handleConfigChange('style_config', { theme: e.target.value })
                                    }
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="primary_color">Primary Color</label>
                                <input
                                    id="primary_color"
                                    type="color"
                                    value={formData.style_config.primary_color}
                                    onChange={(e) =>
                                        handleConfigChange('style_config', { primary_color: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="font_family">Font Family</label>
                                <input
                                    id="font_family"
                                    type="text"
                                    value={formData.style_config.font_family}
                                    onChange={(e) =>
                                        handleConfigChange('style_config', { font_family: e.target.value })
                                    }
                                    placeholder="Arial, sans-serif"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'filters' && (
                    <div className="form-section">
                        <h3 className="section-title">Filters ({formData.filter_config.filters.length})</h3>
                        <div className="filters-config-list">
                            {formData.filter_config.filters.map((filter, index) => (
                                <div key={index} className="filter-config-item">
                                    <div className="filter-config-row">
                                        <span className="filter-name-display">{filter.name}</span>
                                        <span className="filter-type-display">{filter.type}</span>
                                        <span className="filter-label-display">{filter.label}</span>
                                        <span className="filter-required">{filter.required ? 'Required' : 'Optional'}</span>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                const newFilters = formData.filter_config.filters.filter((_, i) => i !== index);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    filter_config: { ...prev.filter_config, filters: newFilters },
                                                }));
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <small className="helper-text">Edit filters in the advanced configuration or use the API</small>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 24 }}>
                            Parameters ({formData.parameter_config.parameters.length})
                        </h3>
                        <div className="parameters-config-list">
                            {formData.parameter_config.parameters.map((param, index) => (
                                <div key={index} className="parameter-config-item">
                                    <div className="parameter-config-row">
                                        <span className="param-name-display">{param.name}</span>
                                        <span className="param-type-display">{param.type}</span>
                                        <span className="param-default-display">Default: {param.default || 'None'}</span>
                                        <span className="param-required">{param.required ? 'Required' : 'Optional'}</span>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                const newParams = formData.parameter_config.parameters.filter((_, i) => i !== index);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    parameter_config: { ...prev.parameter_config, parameters: newParams },
                                                }));
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <small className="helper-text">Edit parameters in the advanced configuration or use the API</small>
                        </div>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="form-section">
                        <h3 className="section-title">Export Configuration</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="export_formats">Export Formats</label>
                                <select
                                    id="export_formats"
                                    multiple
                                    value={formData.export_config.formats || []}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                                        handleConfigChange('export_config', { formats: selected });
                                    }}
                                    className="multi-select"
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                    <option value="csv">CSV</option>
                                    <option value="json">JSON</option>
                                    <option value="pptx">PowerPoint</option>
                                    <option value="html">HTML</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="page_size">Page Size</label>
                                <select
                                    id="page_size"
                                    value={formData.export_config.page_size || 'A4'}
                                    onChange={(e) =>
                                        handleConfigChange('export_config', { page_size: e.target.value })
                                    }
                                >
                                    <option value="A4">A4</option>
                                    <option value="A3">A3</option>
                                    <option value="letter">Letter</option>
                                    <option value="legal">Legal</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="orientation">Orientation</label>
                                <select
                                    id="orientation"
                                    value={formData.export_config.orientation || 'portrait'}
                                    onChange={(e) =>
                                        handleConfigChange('export_config', { orientation: e.target.value })
                                    }
                                >
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                </select>
                            </div>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 24 }}>
                            Chart Configuration
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="chart_type">Default Chart Type</label>
                                <select
                                    id="chart_type"
                                    value={formData.chart_config.default_chart_type || 'bar'}
                                    onChange={(e) =>
                                        handleConfigChange('chart_config', { default_chart_type: e.target.value })
                                    }
                                >
                                    <option value="bar">Bar</option>
                                    <option value="line">Line</option>
                                    <option value="pie">Pie</option>
                                    <option value="area">Area</option>
                                    <option value="scatter">Scatter</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chart Colors</label>
                                <input
                                    type="text"
                                    value={(formData.chart_config.colors || []).join(', ')}
                                    onChange={(e) =>
                                        handleConfigChange('chart_config', {
                                            colors: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
                                        })
                                    }
                                    placeholder="#2563eb, #10b981, #f59e0b"
                                />
                            </div>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 24 }}>
                            Applicable Industries
                        </h3>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <input
                                    type="text"
                                    value={formData.applicable_industries.join(', ')}
                                    onChange={(e) =>
                                        handleChange('applicable_industries', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                                    }
                                    placeholder="finance, healthcare, technology, ..."
                                />
                                <small className="helper-text">Comma-separated list of industries</small>
                            </div>
                        </div>
                    </div>
                )}
            </form>

            <ReportConfirmDialog
                isOpen={showCancelConfirm}
                title="Discard Changes"
                message="You have unsaved changes. Are you sure you want to leave?"
                confirmText="Discard"
                confirmVariant="danger"
                onConfirm={() => {
                    setShowCancelConfirm(false);
                    navigate(`/reports/templates/${id}`);
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};