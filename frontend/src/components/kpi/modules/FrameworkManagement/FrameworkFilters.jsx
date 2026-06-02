import React from 'react';

const FrameworkFilters = ({ sectors, filters, onFilterChange, onRefresh, loading }) => {
    return (
        <div className="framework-filters">
            <div className="filters-row">
                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ status: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Status</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Sector</label>
                    <select
                        value={filters.sector}
                        onChange={(e) => onFilterChange({ sector: e.target.value })}
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

                <div className="filter-group search-group">
                    <label className="filter-label">Search</label>
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => onFilterChange({ search: e.target.value })}
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
                    <span className={`refresh-icon ${loading ? 'spin' : ''}`}>⟳</span>
                    Refresh
                </button>
            </div>

            {(filters.status || filters.sector || filters.search) && (
                <div className="active-filters">
                    <span className="active-filters-label">Active Filters:</span>
                    {filters.status && (
                        <span className="filter-tag">
                            Status: {filters.status}
                            <button onClick={() => onFilterChange({ status: '' })} className="filter-tag-remove">×</button>
                        </span>
                    )}
                    {filters.sector && sectors.find(s => s.id === filters.sector) && (
                        <span className="filter-tag">
                            Sector: {sectors.find(s => s.id === filters.sector)?.name}
                            <button onClick={() => onFilterChange({ sector: '' })} className="filter-tag-remove">×</button>
                        </span>
                    )}
                    {filters.search && (
                        <span className="filter-tag">
                            Search: {filters.search}
                            <button onClick={() => onFilterChange({ search: '' })} className="filter-tag-remove">×</button>
                        </span>
                    )}
                    <button
                        className="clear-filters"
                        onClick={() => onFilterChange({ status: '', sector: '', search: '' })}
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default FrameworkFilters;