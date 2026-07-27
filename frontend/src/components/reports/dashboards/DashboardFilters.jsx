// frontend/src/components/reports/dashboards/DashboardFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import './dashboards.css';

export const DashboardFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const dashboardTypes = [
        { value: '', label: 'All Types' },
        { value: 'executive', label: 'Executive' },
        { value: 'departmental', label: 'Departmental' },
        { value: 'team', label: 'Team' },
        { value: 'personal', label: 'Personal' },
        { value: 'custom', label: 'Custom' },
    ];

    const handleChange = (field, value) => {
        onFilterChange?.(field, value || null);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`dashboard-filters ${className}`}>
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
                    <label className="filter-label">Dashboard Type</label>
                    <select
                        className="filter-select"
                        value={filters.dashboard_type || ''}
                        onChange={(e) => handleChange('dashboard_type', e.target.value)}
                    >
                        {dashboardTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
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
                <div className="filter-group">
                    <label className="filter-label">Shared</label>
                    <select
                        className="filter-select"
                        value={filters.is_shared ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('is_shared', val === '' ? null : val === 'true');
                        }}
                    >
                        <option value="">All</option>
                        <option value="true">Shared</option>
                        <option value="false">Private</option>
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
            </div>
        </div>
    );
};

DashboardFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};