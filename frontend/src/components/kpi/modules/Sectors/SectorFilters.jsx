import React from 'react';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';

const SECTOR_TYPES = [
    { value: 'COMMERCIAL', label: 'Commercial / Corporate' },
    { value: 'NGO', label: 'NGO / Non-Profit' },
    { value: 'PUBLIC', label: 'Public Sector / Government' },
    { value: 'CONSULTING', label: 'Consulting / Professional Services' },
];

const SectorFilters = ({ filters, onFilterChange, onRefresh, loading }) => {
    const handleFilterChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFilterChange({ sectorType: '', isActive: '', search: '' });
    };

    const hasActiveFilters = filters.sectorType || filters.isActive || filters.search;

    return (
        <div className="sector-filters">
            <div className="filters-row">
                <div className="filter-group">
                    <label className="filter-label">Sector Type</label>
                    <select
                        value={filters.sectorType}
                        onChange={(e) => handleFilterChange('sectorType', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Types</option>
                        {SECTOR_TYPES.map(type => (
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
                    {filters.sectorType && (
                        <span className="filter-tag">
                            Type: {SECTOR_TYPES.find(t => t.value === filters.sectorType)?.label}
                            <button onClick={() => handleFilterChange('sectorType', '')} className="filter-tag-remove">×</button>
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

export default SectorFilters;