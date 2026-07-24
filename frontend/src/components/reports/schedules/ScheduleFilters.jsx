// frontend/src/components/reports/schedules/ScheduleFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import './schedules.css';

export const ScheduleFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const frequencies = [
        { value: '', label: 'All Frequencies' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Bi-Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'biannual', label: 'Bi-Annual' },
        { value: 'annual', label: 'Annual' },
        { value: 'custom', label: 'Custom' },
    ];

    const statuses = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'running', label: 'Running' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const handleChange = (field, value) => {
        onFilterChange?.(field, value || null);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`schedule-filters ${className}`}>
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
                    <label className="filter-label">Frequency</label>
                    <select
                        className="filter-select"
                        value={filters.frequency || ''}
                        onChange={(e) => handleChange('frequency', e.target.value)}
                    >
                        {frequencies.map((opt) => (
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
                        {statuses.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Active</label>
                    <select
                        className="filter-select"
                        value={filters.is_active ?? ''}
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
            </div>
        </div>
    );
};

ScheduleFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};