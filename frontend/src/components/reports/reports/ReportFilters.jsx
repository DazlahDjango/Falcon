// frontend/src/components/reports/reports/ReportFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import { REPORT_TYPE_LABELS } from '../../../config/constants/reportConstants';
import './reports.css';

export const ReportFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const reportTypes = [
        { value: '', label: 'All Types' },
        ...Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => ({ value, label }))
    ];

    const statuses = [
        { value: '', label: 'All Statuses' },
        { value: 'draft', label: 'Draft' },
        { value: 'queued', label: 'Queued' },
        { value: 'generating', label: 'Generating' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'archived', label: 'Archived' },
    ];

    const categories = [
        { value: '', label: 'All Categories' },
        { value: 'operational', label: 'Operational' },
        { value: 'strategic', label: 'Strategic' },
        { value: 'financial', label: 'Financial' },
        { value: 'hr', label: 'HR' },
        { value: 'compliance', label: 'Compliance' },
        { value: 'impact', label: 'Impact' },
        { value: 'project', label: 'Project' },
    ];

    const handleChange = (field, value) => {
        onFilterChange?.(field, value || null);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`report-filters ${className}`}>
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
                    <label className="filter-label">Report Type</label>
                    <select
                        className="filter-select"
                        value={filters.report_type || ''}
                        onChange={(e) => handleChange('report_type', e.target.value)}
                    >
                        {reportTypes.map((opt) => (
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
                    <label className="filter-label">Category</label>
                    <select
                        className="filter-select"
                        value={filters.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        {categories.map((opt) => (
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
                <div className="filter-group">
                    <label className="filter-label">Archived</label>
                    <select
                        className="filter-select"
                        value={filters.is_archived ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('is_archived', val === '' ? null : val === 'true');
                        }}
                    >
                        <option value="">All</option>
                        <option value="true">Archived</option>
                        <option value="false">Active</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

ReportFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};