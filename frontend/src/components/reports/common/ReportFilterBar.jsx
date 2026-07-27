// frontend/src/components/reports/common/ReportFilterBar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportFilterBar = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const filterOptions = {
        report_type: [
            { value: '', label: 'All Types' },
            { value: 'kpi', label: 'KPI Report' },
            { value: 'departmental', label: 'Departmental' },
            { value: 'executive', label: 'Executive' },
            { value: 'compliance', label: 'Compliance' },
            { value: 'trend', label: 'Trend Analysis' },
            { value: 'comparative', label: 'Comparative' },
            { value: 'mission', label: 'Mission Status' },
            { value: 'pip', label: 'PIP Tracking' },
            { value: 'custom', label: 'Custom' },
        ],
        status: [
            { value: '', label: 'All Statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'queued', label: 'Queued' },
            { value: 'generating', label: 'Generating' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
            { value: 'archived', label: 'Archived' },
        ],
        category: [
            { value: '', label: 'All Categories' },
            { value: 'operational', label: 'Operational' },
            { value: 'strategic', label: 'Strategic' },
            { value: 'financial', label: 'Financial' },
            { value: 'hr', label: 'HR' },
            { value: 'compliance', label: 'Compliance' },
            { value: 'impact', label: 'Impact' },
            { value: 'project', label: 'Project' },
        ],
    };

    const handleChange = (field, value) => {
        onFilterChange?.({ ...filters, [field]: value || null });
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`report-filter-bar ${className}`}>
            <div className="filter-group">
                <label className="filter-label">Type</label>
                <select
                    className="filter-select"
                    value={filters.report_type || ''}
                    onChange={(e) => handleChange('report_type', e.target.value)}
                >
                    {filterOptions.report_type.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                    className="filter-select"
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                >
                    {filterOptions.status.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                    className="filter-select"
                    value={filters.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                >
                    {filterOptions.category.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
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
            {hasActiveFilters() && (
                <button className="filter-reset btn btn-outline btn-sm" onClick={onReset}>
                    Reset Filters
                </button>
            )}
        </div>
    );
};

ReportFilterBar.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};