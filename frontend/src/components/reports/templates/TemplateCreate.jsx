// frontend/src/components/reports/templates/TemplateCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useTemplates } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import './templates.css';

export const TemplateCreate = () => {
    const navigate = useNavigate();
    const { create, loading, error, clearErrors } = useTemplates({ autoFetch: false });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        template_type: 'custom',
        category: '',
        sector: 'all',
        department: '',
        layout_config: { grid_columns: 12, row_height: 100, spacing: 10, sections: ['overview'] },
        widget_config: { widgets: [] },
        filter_config: { filters: [] },
        parameter_config: { parameters: [] },
        chart_config: { default_chart_type: 'bar', colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'], show_legend: true, show_tooltip: true },
        table_config: { responsive: true, striped: true, bordered: true, hover: true, sortable: true },
        style_config: { theme: 'light', font_family: 'Arial', primary_color: '#2563eb' },
        export_config: { formats: ['pdf', 'excel'], page_size: 'A4', orientation: 'portrait' },
        applicable_industries: [],
        org_size: 0,
        is_published: false,
        is_default: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleConfigChange = (configName, value) => {
        setFormData((prev) => ({
            ...prev,
            [configName]: { ...prev[configName], ...value },
        }));
    };

    const handleAddWidget = () => {
        const newWidget = {
            id: Date.now().toString(),
            type: 'kpi',
            title: 'New Widget',
            position: { x: 0, y: 0 },
            size: { w: 4, h: 3 },
            config: {},
        };
        setFormData((prev) => ({
            ...prev,
            widget_config: {
                ...prev.widget_config,
                widgets: [...prev.widget_config.widgets, newWidget],
            },
        }));
    };

    const handleRemoveWidget = (index) => {
        setFormData((prev) => ({
            ...prev,
            widget_config: {
                ...prev.widget_config,
                widgets: prev.widget_config.widgets.filter((_, i) => i !== index),
            },
        }));
    };

    const handleUpdateWidget = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            widget_config: {
                ...prev.widget_config,
                widgets: prev.widget_config.widgets.map((w, i) =>
                    i === index ? { ...w, [field]: value } : w
                ),
            },
        }));
    };

    const handleAddFilter = () => {
        const newFilter = {
            name: `filter_${Date.now()}`,
            type: 'text',
            label: 'New Filter',
            options: [],
            required: false,
            multiple: false,
        };
        setFormData((prev) => ({
            ...prev,
            filter_config: {
                ...prev.filter_config,
                filters: [...prev.filter_config.filters, newFilter],
            },
        }));
    };

    const handleRemoveFilter = (index) => {
        setFormData((prev) => ({
            ...prev,
            filter_config: {
                ...prev.filter_config,
                filters: prev.filter_config.filters.filter((_, i) => i !== index),
            },
        }));
    };

    const handleAddParameter = () => {
        const newParam = {
            name: `param_${Date.now()}`,
            type: 'string',
            default: '',
            required: false,
        };
        setFormData((prev) => ({
            ...prev,
            parameter_config: {
                ...prev.parameter_config,
                parameters: [...prev.parameter_config.parameters, newParam],
            },
        }));
    };

    const handleRemoveParameter = (index) => {
        setFormData((prev) => ({
            ...prev,
            parameter_config: {
                ...prev.parameter_config,
                parameters: prev.parameter_config.parameters.filter((_, i) => i !== index),
            },
        }));
    };

    const handleIndustryAdd = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            const industry = e.target.value.trim();
            if (industry && !formData.applicable_industries.includes(industry)) {
                setFormData((prev) => ({
                    ...prev,
                    applicable_industries: [...prev.applicable_industries, industry],
                }));
            }
            e.target.value = '';
        }
    };

    const handleIndustryRemove = (industry) => {
        setFormData((prev) => ({
            ...prev,
            applicable_industries: prev.applicable_industries.filter((i) => i !== industry),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await create(formData);
            if (result) {
                navigate(`/reports/templates/${result.id}`);
            }
        } catch (err) {
            console.error('Failed to create template:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (formData.name) {
            setShowCancelConfirm(true);
        } else {
            navigate('/reports/templates');
        }
    };

    if (loading) {
        return <ReportLoading variant="spinner" text="Creating template..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => clearErrors()}
                title="Failed to create template"
            />
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

    const widgetTypes = [
        'kpi', 'chart', 'table', 'heatmap', 'trend', 'gauge',
        'pie', 'bar', 'line', 'area', 'scatter', 'map',
        'list', 'summary', 'mission', 'pip', 'compliance', 'custom'
    ];

    return (
        <div className="template-form-container">
            <div className="template-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Create Template</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim()}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Creating...' : 'Create Template'}
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
                                <label htmlFor="template_type">Template Type *</label>
                                <select
                                    id="template_type"
                                    value={formData.template_type}
                                    onChange={(e) => handleChange('template_type', e.target.value)}
                                    required
                                >
                                    {templateTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
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
                                    Publish Immediately
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
                                        <select
                                            value={widget.type}
                                            onChange={(e) => handleUpdateWidget(index, 'type', e.target.value)}
                                        >
                                            {widgetTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={widget.title}
                                            onChange={(e) => handleUpdateWidget(index, 'title', e.target.value)}
                                            placeholder="Widget title"
                                        />
                                        <input
                                            type="number"
                                            value={widget.size?.w || 4}
                                            onChange={(e) =>
                                                handleUpdateWidget(index, 'size', {
                                                    ...widget.size,
                                                    w: parseInt(e.target.value) || 4,
                                                })
                                            }
                                            placeholder="Width"
                                            min="1"
                                            max="12"
                                        />
                                        <input
                                            type="number"
                                            value={widget.size?.h || 3}
                                            onChange={(e) =>
                                                handleUpdateWidget(index, 'size', {
                                                    ...widget.size,
                                                    h: parseInt(e.target.value) || 3,
                                                })
                                            }
                                            placeholder="Height"
                                            min="1"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoveWidget(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-outline btn-sm add-widget"
                                onClick={handleAddWidget}
                            >
                                <FiPlus size={14} />
                                Add Widget
                            </button>
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
                                        <input
                                            type="text"
                                            value={filter.name}
                                            onChange={(e) => {
                                                const newFilters = [...formData.filter_config.filters];
                                                newFilters[index] = { ...newFilters[index], name: e.target.value };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    filter_config: { ...prev.filter_config, filters: newFilters },
                                                }));
                                            }}
                                            placeholder="Filter name"
                                        />
                                        <select
                                            value={filter.type}
                                            onChange={(e) => {
                                                const newFilters = [...formData.filter_config.filters];
                                                newFilters[index] = { ...newFilters[index], type: e.target.value };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    filter_config: { ...prev.filter_config, filters: newFilters },
                                                }));
                                            }}
                                        >
                                            <option value="date_range">Date Range</option>
                                            <option value="dropdown">Dropdown</option>
                                            <option value="multi_select">Multi-Select</option>
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="boolean">Boolean</option>
                                            <option value="hierarchy">Hierarchical</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={filter.label}
                                            onChange={(e) => {
                                                const newFilters = [...formData.filter_config.filters];
                                                newFilters[index] = { ...newFilters[index], label: e.target.value };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    filter_config: { ...prev.filter_config, filters: newFilters },
                                                }));
                                            }}
                                            placeholder="Display label"
                                        />
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={filter.required || false}
                                                onChange={(e) => {
                                                    const newFilters = [...formData.filter_config.filters];
                                                    newFilters[index] = { ...newFilters[index], required: e.target.checked };
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        filter_config: { ...prev.filter_config, filters: newFilters },
                                                    }));
                                                }}
                                            />
                                            Required
                                        </label>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoveFilter(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-outline btn-sm add-filter"
                                onClick={handleAddFilter}
                            >
                                <FiPlus size={14} />
                                Add Filter
                            </button>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 24 }}>
                            Parameters ({formData.parameter_config.parameters.length})
                        </h3>
                        <div className="parameters-config-list">
                            {formData.parameter_config.parameters.map((param, index) => (
                                <div key={index} className="parameter-config-item">
                                    <div className="parameter-config-row">
                                        <input
                                            type="text"
                                            value={param.name}
                                            onChange={(e) => {
                                                const newParams = [...formData.parameter_config.parameters];
                                                newParams[index] = { ...newParams[index], name: e.target.value };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    parameter_config: { ...prev.parameter_config, parameters: newParams },
                                                }));
                                            }}
                                            placeholder="Parameter name"
                                        />
                                        <select
                                            value={param.type}
                                            onChange={(e) => {
                                                const newParams = [...formData.parameter_config.parameters];
                                                newParams[index] = { ...newParams[index], type: e.target.value };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    parameter_config: { ...prev.parameter_config, parameters: newParams },
                                                }));
                                            }}
                                        >
                                            <option value="string">String</option>
                                            <option value="number">Number</option>
                                            <option value="boolean">Boolean</option>
                                            <option value="date">Date</option>
                                            <option value="array">Array</option>
                                            <option value="object">Object</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={param.default || ''}
                                            onChange={(e) => {
                                                const newParams = [...formData.parameter_config.parameters];
                                                newParams[index] = { ...newParams[index], default: e.target.value };
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    parameter_config: { ...prev.parameter_config, parameters: newParams },
                                                }));
                                            }}
                                            placeholder="Default value"
                                        />
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={param.required || false}
                                                onChange={(e) => {
                                                    const newParams = [...formData.parameter_config.parameters];
                                                    newParams[index] = { ...newParams[index], required: e.target.checked };
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        parameter_config: { ...prev.parameter_config, parameters: newParams },
                                                    }));
                                                }}
                                            />
                                            Required
                                        </label>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoveParameter(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-outline btn-sm add-parameter"
                                onClick={handleAddParameter}
                            >
                                <FiPlus size={14} />
                                Add Parameter
                            </button>
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
                                    placeholder="Type industry and press Enter"
                                    onKeyDown={handleIndustryAdd}
                                    className="industry-input"
                                />
                                <div className="industries-list">
                                    {formData.applicable_industries.map((industry) => (
                                        <span key={industry} className="industry-tag">
                                            {industry}
                                            <button
                                                type="button"
                                                className="industry-remove"
                                                onClick={() => handleIndustryRemove(industry)}
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
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
                    navigate('/reports/templates');
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};