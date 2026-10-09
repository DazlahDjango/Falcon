import React from 'react';
import PropTypes from 'prop-types';
import { FiFilter, FiX } from 'react-icons/fi';
import { useSectors } from '../../../hooks/tenant';
import { REPORT_TYPE_LABELS, REPORT_CATEGORY_LABELS } from '../../../config/constants/reportConstants';
import './templates.css';

export const TemplateFilters = ({
    filters = {},
    onFilterChange,
    onReset,
    className = '',
}) => {
    const { sectors } = useSectors({ autoFetch: true });

    const templateTypes = [
        { value: '', label: 'All Types' },
        ...Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => ({ value, label }))
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
                        <option value="">All Sectors</option>
                        {sectors && sectors.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                                {sec.name} {sec.sector_type ? `(${sec.sector_type})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <input
                        className="filter-input"
                        type="text"
                        list="filter-category-options"
                        value={filters.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                        placeholder="Filter by category..."
                    />
                    <datalist id="filter-category-options">
                        {Object.entries(REPORT_CATEGORY_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </datalist>
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