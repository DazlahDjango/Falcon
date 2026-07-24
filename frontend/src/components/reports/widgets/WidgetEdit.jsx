// frontend/src/components/reports/widgets/WidgetEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useWidget, useDashboards } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import './widgets.css';

export const WidgetEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        widget,
        loading,
        error,
        fetchOne,
        update,
        clearErrors,
    } = useWidget(id, { autoFetch: true });

    const { dashboards, fetchList: fetchDashboards } = useDashboards({
        autoFetch: false,
    });

    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        fetchDashboards({ pageSize: 100 });
        if (widget) {
            setFormData({
                name: widget.name || '',
                title: widget.title || '',
                subtitle: widget.subtitle || '',
                widget_type: widget.widget_type || 'kpi',
                dashboard: widget.dashboard || '',
                config: widget.config || {},
                data_config: widget.data_config || {},
                style_config: widget.style_config || {},
                position: widget.position || { x: 0, y: 0 },
                size: widget.size || { w: 4, h: 3 },
                is_active: widget.is_active !== undefined ? widget.is_active : true,
                is_visible: widget.is_visible !== undefined ? widget.is_visible : true,
                auto_refresh: widget.auto_refresh || false,
                refresh_interval: widget.refresh_interval || 60,
                data_source: widget.data_source || '',
                data_query: widget.data_query || {},
                filters: widget.filters || {},
                sort: widget.sort || [],
                aggregation: widget.aggregation || {},
                limit: widget.limit || 100,
            });
        }
    }, [widget, fetchDashboards]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleConfigChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            config: { ...prev.config, [field]: value },
        }));
    };

    const handleSizeChange = (dimension, value) => {
        setFormData((prev) => ({
            ...prev,
            size: { ...prev.size, [dimension]: parseInt(value) || 0 },
        }));
    };

    const handleAddFilter = () => {
        setFormData((prev) => ({
            ...prev,
            filters: { ...prev.filters, '': '' },
        }));
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...formData.filters };
        if (key === '') {
            const newKey = prompt('Enter filter name:');
            if (newKey) {
                newFilters[newKey] = value;
                delete newFilters[''];
                setFormData((prev) => ({ ...prev, filters: newFilters }));
            }
        } else {
            newFilters[key] = value;
            setFormData((prev) => ({ ...prev, filters: newFilters }));
        }
    };

    const handleRemoveFilter = (key) => {
        const newFilters = { ...formData.filters };
        delete newFilters[key];
        setFormData((prev) => ({ ...prev, filters: newFilters }));
    };

    const handleAddSort = () => {
        setFormData((prev) => ({
            ...prev,
            sort: [...prev.sort, { field: '', direction: 'asc' }],
        }));
    };

    const handleSortChange = (index, field, value) => {
        const newSort = [...formData.sort];
        newSort[index] = { ...newSort[index], [field]: value };
        setFormData((prev) => ({ ...prev, sort: newSort }));
    };

    const handleRemoveSort = (index) => {
        setFormData((prev) => ({
            ...prev,
            sort: prev.sort.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData) return;
        setIsSubmitting(true);
        try {
            await update(id, formData);
            navigate(`/reports/widgets/${id}`);
        } catch (err) {
            console.error('Failed to update widget:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (hasChanges()) {
            setShowCancelConfirm(true);
        } else {
            navigate(`/reports/widgets/${id}`);
        }
    };

    const hasChanges = () => {
        if (!widget || !formData) return false;
        return JSON.stringify(widget) !== JSON.stringify({ ...widget, ...formData });
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading widget..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load widget"
            />
        );
    }

    if (!widget || !formData) {
        return <ReportError error="Widget not found" title="Widget not found" />;
    }

    const widgetTypes = [
        { value: 'kpi', label: 'KPI Card' },
        { value: 'chart', label: 'Chart' },
        { value: 'table', label: 'Table' },
        { value: 'heatmap', label: 'Heatmap' },
        { value: 'trend', label: 'Trend Chart' },
        { value: 'gauge', label: 'Gauge' },
        { value: 'pie', label: 'Pie Chart' },
        { value: 'bar', label: 'Bar Chart' },
        { value: 'line', label: 'Line Chart' },
        { value: 'area', label: 'Area Chart' },
        { value: 'scatter', label: 'Scatter Plot' },
        { value: 'map', label: 'Map' },
        { value: 'list', label: 'List' },
        { value: 'summary', label: 'Summary Card' },
        { value: 'mission', label: 'Mission Status' },
        { value: 'pip', label: 'PIP Tracker' },
        { value: 'compliance', label: 'Compliance Status' },
        { value: 'custom', label: 'Custom Widget' },
    ];

    return (
        <div className="widget-form-container">
            <div className="widget-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Edit Widget: {widget.name}</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim() || !formData.dashboard}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form className="widget-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="name">Widget Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter widget name"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Display Title</label>
                            <input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="Display title (optional)"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subtitle">Subtitle</label>
                            <input
                                id="subtitle"
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => handleChange('subtitle', e.target.value)}
                                placeholder="Subtitle (optional)"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="widget_type">Widget Type</label>
                            <input
                                id="widget_type"
                                type="text"
                                value={widget.widget_type}
                                disabled
                                className="disabled-input"
                            />
                            <small className="helper-text">Widget type cannot be changed</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="dashboard">Dashboard *</label>
                            <select
                                id="dashboard"
                                value={formData.dashboard}
                                onChange={(e) => handleChange('dashboard', e.target.value)}
                                required
                            >
                                <option value="">Select Dashboard...</option>
                                {dashboards.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                />
                                Active
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_visible}
                                    onChange={(e) => handleChange('is_visible', e.target.checked)}
                                />
                                Visible
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Size & Position</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="pos_x">X Position</label>
                            <input
                                id="pos_x"
                                type="number"
                                value={formData.position.x}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        position: { ...prev.position, x: parseInt(e.target.value) || 0 },
                                    }))
                                }
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pos_y">Y Position</label>
                            <input
                                id="pos_y"
                                type="number"
                                value={formData.position.y}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        position: { ...prev.position, y: parseInt(e.target.value) || 0 },
                                    }))
                                }
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="size_w">Width (columns)</label>
                            <input
                                id="size_w"
                                type="number"
                                value={formData.size.w}
                                onChange={(e) => handleSizeChange('w', e.target.value)}
                                min="1"
                                max="12"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="size_h">Height (rows)</label>
                            <input
                                id="size_h"
                                type="number"
                                value={formData.size.h}
                                onChange={(e) => handleSizeChange('h', e.target.value)}
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Data Configuration</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="data_source">Data Source</label>
                            <select
                                id="data_source"
                                value={formData.data_source}
                                onChange={(e) => handleChange('data_source', e.target.value)}
                            >
                                <option value="">Auto-detect</option>
                                <option value="kpi">KPI Data</option>
                                <option value="reviews">Review Data</option>
                                <option value="tasks">Task Data</option>
                                <option value="pip">PIP Data</option>
                                <option value="combined">Combined Data</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="limit">Limit</label>
                            <input
                                id="limit"
                                type="number"
                                value={formData.limit}
                                onChange={(e) => handleChange('limit', parseInt(e.target.value) || 100)}
                                min="1"
                                max="1000"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.auto_refresh}
                                    onChange={(e) => handleChange('auto_refresh', e.target.checked)}
                                />
                                Auto-Refresh
                            </label>
                        </div>
                        {formData.auto_refresh && (
                            <div className="form-group">
                                <label htmlFor="refresh_interval">Refresh Interval (seconds)</label>
                                <input
                                    id="refresh_interval"
                                    type="number"
                                    value={formData.refresh_interval}
                                    onChange={(e) => handleChange('refresh_interval', parseInt(e.target.value) || 60)}
                                    min="5"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Configuration</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="config">Config (JSON)</label>
                            <textarea
                                id="config"
                                value={JSON.stringify(formData.config, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        handleChange('config', parsed);
                                    } catch {
                                        // Invalid JSON, keep as is
                                    }
                                }}
                                rows={4}
                                className="code-editor"
                                placeholder="{}"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Filters</h3>
                    {Object.entries(formData.filters).map(([key, value]) => (
                        <div key={key} className="filter-item">
                            <input
                                type="text"
                                value={key}
                                className="filter-key"
                                placeholder="Field"
                                onChange={(e) => {
                                    const newFilters = { ...formData.filters };
                                    const oldKey = key;
                                    const newKey = e.target.value;
                                    if (newKey !== oldKey) {
                                        newFilters[newKey] = value;
                                        delete newFilters[oldKey];
                                        setFormData((prev) => ({ ...prev, filters: newFilters }));
                                    }
                                }}
                            />
                            <input
                                type="text"
                                value={value}
                                className="filter-value"
                                placeholder="Value"
                                onChange={(e) => handleFilterChange(key, e.target.value)}
                            />
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveFilter(key)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn btn-outline btn-sm add-filter"
                        onClick={handleAddFilter}
                    >
                        + Add Filter
                    </button>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Sorting</h3>
                    {formData.sort.map((sort, index) => (
                        <div key={index} className="sort-item">
                            <input
                                type="text"
                                value={sort.field}
                                placeholder="Field"
                                onChange={(e) => handleSortChange(index, 'field', e.target.value)}
                            />
                            <select
                                value={sort.direction}
                                onChange={(e) => handleSortChange(index, 'direction', e.target.value)}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveSort(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn btn-outline btn-sm add-sort"
                        onClick={handleAddSort}
                    >
                        + Add Sort
                    </button>
                </div>
            </form>

            <ReportConfirmDialog
                isOpen={showCancelConfirm}
                title="Discard Changes"
                message="You have unsaved changes. Are you sure you want to leave?"
                confirmText="Discard"
                confirmVariant="danger"
                onConfirm={() => {
                    setShowCancelConfirm(false);
                    navigate(`/reports/widgets/${id}`);
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};