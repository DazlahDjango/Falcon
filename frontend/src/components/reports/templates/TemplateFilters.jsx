// frontend/src/components/reports/templates/TemplateFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import './templates.css';

export const TemplateFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const templateTypes = [
        { value: '', label: 'All Types' },
        { value: 'executive', label: 'Executive Dashboard' },
        { value: 'departmental', label: 'Departmental Scorecard' },
        { value: 'kpi', label: 'KPI Report' },
        { value: 'mission', label: 'Mission Status' },
        { value: 'compliance', label: 'Compliance Report' },
        { value: 'trend', label: 'Trend Analysis' },
        { value: 'comparative', label: 'Comparative Analysis' },
        { value: 'pip', label: 'PIP Report' },
        { value: 'custom', label: 'Custom Template' },
    ];

    const sectors = [
        { value: '', label: 'All Sectors' },
        { value: 'commercial', label: 'Commercial/Corporate' },
        { value: 'ngo', label: 'NGO/Non-Profit' },
        { value: 'public', label: 'Public Sector' },
        { value: 'consulting', label: 'Consulting' },
    ];

    const handleChange = (field, value) => {
        onFilterChange?.(field, value || null);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`template-filters ${className}`}>
            <div className="filters-header">
                <span className="filters-title">
                    <FiFilter size={16} />
                    Filters
                </span>
                {hasActiveFilters() && (
                    <button className="filters-clear" onClick={onReset}>
                        <FiX size={14} />
                        Clear All
                    </button>
                )}
            </div>
            <div className="filters-grid">
                <div className="filter-group">
                    <label className="filter-label">Template Type</label>
                    <select
                        className="filter-select"
                        value={filters.template_type || ''}
                        onChange={(e) => handleChange('template_type', e.target.value)}
                    >
                        {templateTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Sector</label>
                    <select
                        className="filter-select"
                        value={filters.sector || ''}
                        onChange={(e) => handleChange('sector', e.target.value)}
                    >
                        {sectors.map((sector) => (
                            <option key={sector.value} value={sector.value}>
                                {sector.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <input
                        className="filter-input"
                        type="text"
                        value={filters.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                        placeholder="Filter by category..."
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Published</label>
                    <select
                        className="filter-select"
                        value={filters.is_published ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('is_published', val === '' ? null : val === 'true');
                        }}
                    >
                        <option value="">All</option>
                        <option value="true">Published</option>
                        <option value="false">Draft</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">System</label>
                    <select
                        className="filter-select"
                        value={filters.is_system ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('is_system', val === '' ? null : val === 'true');
                        }}
                    >
                        <option value="">All</option>
                        <option value="true">System</option>
                        <option value="false">Custom</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Default</label>
                    <select
                        className="filter-select"
                        value={filters.is_default ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('is_default', val === '' ? null : val === 'true');
                        }}
                    >
                        <option value="">All</option>
                        <option value="true">Default</option>
                        <option value="false">Non-Default</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

TemplateFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};