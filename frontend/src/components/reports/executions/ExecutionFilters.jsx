// frontend/src/components/reports/executions/ExecutionFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import './executions.css';

export const ExecutionFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const statuses = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'running', label: 'Running' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'timeout', label: 'Timeout' },
    ];

    const handleChange = (field, value) => {
        onFilterChange?.(field, value || null);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`execution-filters ${className}`}>
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
                    <label className="filter-label">Status</label>
                    <select
                        className="filter-select"
                        value={filters.status || ''}
                        onChange={(e) => handleChange('status', e.target.value)}
                    >
                        {statuses.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Report</label>
                    <input
                        className="filter-input"
                        type="text"
                        value={filters.report || ''}
                        onChange={(e) => handleChange('report', e.target.value)}
                        placeholder="Report ID or name..."
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Triggered By</label>
                    <input
                        className="filter-input"
                        type="text"
                        value={filters.triggered_by || ''}
                        onChange={(e) => handleChange('triggered_by', e.target.value)}
                        placeholder="User ID or name..."
                    />
                </div>
            </div>
        </div>
    );
};

ExecutionFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};