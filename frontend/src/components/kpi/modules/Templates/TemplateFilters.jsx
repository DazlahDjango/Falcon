import React from 'react';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';

const DIFFICULTY_OPTIONS = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
];

const TemplateFilters = ({ sectors, filters, onFilterChange, onRefresh, loading }) => {
    const handleFilterChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFilterChange({ sector: '', difficulty: '', isPublished: '', search: '' });
    };

    const hasActiveFilters = filters.sector || filters.difficulty || filters.isPublished || filters.search;

    return (
        <div className="template-filters">
            <div className="filters-row">
                <div className="filter-group">
                    <label className="filter-label">Sector</label>
                    <select
                        value={filters.sector}
                        onChange={(e) => handleFilterChange('sector', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Sectors</option>
                        {sectors.map(sector => (
                            <option key={sector.id} value={sector.id}>
                                {sector.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Difficulty</label>
                    <select
                        value={filters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Levels</option>
                        {DIFFICULTY_OPTIONS.map(diff => (
                            <option key={diff.value} value={diff.value}>
                                {diff.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                        value={filters.isPublished}
                        onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All</option>
                        <option value="true">Published</option>
                        <option value="false">Draft</option>
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
                    {filters.sector && (
                        <span className="filter-tag">
                            Sector: {sectors.find(s => s.id === filters.sector)?.name}
                            <button onClick={() => handleFilterChange('sector', '')} className="filter-tag-remove">×</button>
                        </span>
                    )}
                    {filters.difficulty && (
                        <span className="filter-tag">
                            Difficulty: {DIFFICULTY_OPTIONS.find(d => d.value === filters.difficulty)?.label}
                            <button onClick={() => handleFilterChange('difficulty', '')} className="filter-tag-remove">×</button>
                        </span>
                    )}
                    {filters.isPublished && (
                        <span className="filter-tag">
                            Status: {filters.isPublished === 'true' ? 'Published' : 'Draft'}
                            <button onClick={() => handleFilterChange('isPublished', '')} className="filter-tag-remove">×</button>
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

export default TemplateFilters;