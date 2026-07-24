// frontend/src/components/reports/shares/ShareFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import './shares.css';

export const ShareFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const shareTypes = [
        { value: '', label: 'All Types' },
        { value: 'internal', label: 'Internal Share' },
        { value: 'external', label: 'External Share' },
        { value: 'public', label: 'Public Link' },
    ];

    const permissions = [
        { value: '', label: 'All Permissions' },
        { value: 'view', label: 'View Only' },
        { value: 'comment', label: 'View & Comment' },
        { value: 'edit', label: 'View, Comment & Edit' },
        { value: 'export', label: 'Full Access' },
    ];

    const handleChange = (field, value) => {
        onFilterChange?.(field, value || null);
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((v) => v !== null && v !== '' && v !== undefined);
    };

    return (
        <div className={`share-filters ${className}`}>
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
                    <label className="filter-label">Share Type</label>
                    <select
                        className="filter-select"
                        value={filters.share_type || ''}
                        onChange={(e) => handleChange('share_type', e.target.value)}
                    >
                        {shareTypes.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Permission</label>
                    <select
                        className="filter-select"
                        value={filters.permission || ''}
                        onChange={(e) => handleChange('permission', e.target.value)}
                    >
                        {permissions.map((opt) => (
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
            </div>
        </div>
    );
};

ShareFilters.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    className: PropTypes.string,
};