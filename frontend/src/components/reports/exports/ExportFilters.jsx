// frontend/src/components/reports/exports/ExportFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import './exports.css';

export const ExportFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const formats = [
        { value: '', label: 'All Formats' },
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel' },
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'pptx', label: 'PowerPoint' },
        { value: 'html', label: 'HTML' },
        { value: 'xml', label: 'XML' },
    ];

    const statuses = [
        { value: '', label: 'All Statuses' },
        { value: 'queued', label: 'Queued' },
        { value: 'processing', label: 'Processing' },
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
        <div className={`export-filters ${className}`}>
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
                    <label className="filter-label">Format</label>
                    <select
                        className="filter-select"
                        value={filters.format || ''}
                        onChange={(e) => handleChange('format', e.target.value)}
                    >
                        {formats.map((opt) => (
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
                    <label className="filter-label">Exported By</label>
                    <input
                        className="filter-input"
                        type="text"
                        value={filters.exported_by || ''}
                        onChange={(e) => handleChange('exported_by', e.target.value)}
                        placeholder="User ID or name..."
                    />
                </div>
            </div>
        </div>
    );
};

ExportFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};