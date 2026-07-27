// frontend/src/components/reports/widgets/WidgetFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter } from 'react-icons/fi';
import './widgets.css';

export const WidgetFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const widgetTypes = [
        { value: '', label: 'All Types' },
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

    const handleChange = (field, value) => {
        onFilterChange?.(field, value || null);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`widget-filters ${className}`}>
            <div className="filter-group">
                <label className="filter-label">Type</label>
                <select
                    className="filter-select"
                    value={filters.widget_type || ''}
                    onChange={(e) => handleChange('widget_type', e.target.value)}
                >
                    {widgetTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                    className="filter-select"
                    value={filters.is_active !== undefined && filters.is_active !== null ? String(filters.is_active) : ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        handleChange('is_active', val === '' ? null : val === 'true');
                    }}
                >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>
            <div className="filter-group">
                <label className="filter-label">Visibility</label>
                <select
                    className="filter-select"
                    value={filters.is_visible !== undefined && filters.is_visible !== null ? String(filters.is_visible) : ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        handleChange('is_visible', val === '' ? null : val === 'true');
                    }}
                >
                    <option value="">All</option>
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                </select>
            </div>
            {hasActiveFilters() && (
                <button className="filter-reset btn btn-outline btn-sm" onClick={onReset}>
                    <FiFilter size={14} />
                    Reset
                </button>
            )}
        </div>
    );
};

WidgetFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};