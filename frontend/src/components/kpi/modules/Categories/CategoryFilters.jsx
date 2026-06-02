import React from 'react';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';

const CATEGORY_TYPES = [
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'IMPACT', label: 'Impact / Outcomes' },
    { value: 'OPERATIONAL', label: 'Operational' },
    { value: 'CUSTOMER', label: 'Customer / Stakeholder' },
    { value: 'INTERNAL', label: 'Internal Process' },
    { value: 'GROWTH', label: 'Growth & Learning' },
    { value: 'COMPLIANCE', label: 'Compliance & Risk' },
];

const CategoryFilters = ({ frameworks, selectedFramework, filters, onFrameworkChange, onFilterChange, onRefresh, loading }) => {
    const handleFilterChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFilterChange({ framework: selectedFramework || '', categoryType: '', isActive: '', search: '' });
    };

    const hasActiveFilters = filters.categoryType || filters.isActive || filters.search;

    return (
        <div className="category-filters">
            <div className="filters-row">
                <div className="filter-group">
                    <label className="filter-label">Framework</label>
                    <select
                        value={selectedFramework || ''}
                        onChange={(e) => onFrameworkChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Frameworks</option>
                        {frameworks.map(fw => (
                            <option key={fw.id} value={fw.id}>
                                {fw.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Category Type</label>
                    <select
                        value={filters.categoryType}
                        onChange={(e) => handleFilterChange('categoryType', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Types</option>
                        {CATEGORY_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                        value={filters.isActive}
                        onChange={(e) => handleFilterChange('isActive', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                <div className="filter-group search-group">
                    <label className="filter-label">Search</label>
                    <div className="search-input-wrapper">
                        <FiSearch className="search-icon" size={14} />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search by name or code..."
                            className="filter-search"
                        />
                    </div>
                </div>

                <button
                    className="filter-refresh"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    <FiRefreshCw size={14} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {hasActiveFilters && (
                <div className="active-filters">
                    <span className="active-filters-label">Active Filters:</span>
                    {filters.categoryType && (
                        <span className="filter-tag">
                            Type: {CATEGORY_TYPES.find(t => t.value === filters.categoryType)?.label}
                            <button onClick={() => handleFilterChange('categoryType', '')} className="filter-tag-remove">×</button>
                        </span>
                    )}
                    {filters.isActive && (
                        <span className="filter-tag">
                            Status: {filters.isActive === 'true' ? 'Active' : 'Inactive'}
                            <button onClick={() => handleFilterChange('isActive', '')} className="filter-tag-remove">×</button>
                        </span>
                    )}
                    {filters.search && (
                        <span className="filter-tag">
                            Search: {filters.search}
                            <button onClick={() => handleFilterChange('search', '')} className="filter-tag-remove">×</button>
                        </span>
                    )}
                    <button className="clear-filters" onClick={clearFilters}>
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoryFilters;