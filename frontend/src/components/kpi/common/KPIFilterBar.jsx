import React from 'react';

const KPIFilterBar = ({ filters, onFilterChange, onClearFilters }) => {
    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

    return (
        <div className="kpi-filter-bar">
            <div className="kpi-filters">
                {/* Example filter - customize based on your needs */}
                {Object.entries(filters).map(([key, value]) => (
                    <div key={key} className="kpi-filter-group">
                        <span className="kpi-filter-label">{key.replace(/_/g, ' ')}</span>
                        <select
                            className="kpi-filter-select"
                            value={value || ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                        >
                            <option value="">All</option>
                            {/* Add options based on filter type */}
                        </select>
                    </div>
                ))}
            </div>
            {hasActiveFilters && (
                <button className="kpi-filter-clear" onClick={onClearFilters}>
                    Clear all
                </button>
            )}
        </div>
    );
};

export default KPIFilterBar;