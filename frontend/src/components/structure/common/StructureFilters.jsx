import React, { useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export const StructureFilters = ({
  filters = {},
  onFilterChange,
  onClearFilters,
  children,
  showSearch = true,
  searchPlaceholder = 'Search...',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    onFilterChange({ ...filters, search: value });
  }, [filters, onFilterChange]);

  const handleFilterChange = useCallback((key, value) => {
    onFilterChange({ ...filters, [key]: value });
  }, [filters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      const clearedFilters = {};
      Object.keys(filters).forEach(key => {
        clearedFilters[key] = '';
      });
      onFilterChange(clearedFilters);
    }
  }, [filters, onFilterChange, onClearFilters]);

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '' && v !== false);

  return (
    <div className={`structure-filters-container ${className}`}>
      <div className="structure-filters-main">
        {showSearch && (
          <div className="filter-search">
            <FiSearch className="search-icon" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="filter-search-input"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="clear-search-btn"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        )}
        <div className="filter-actions">
          {children && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="filter-toggle-btn"
            >
              <FiFilter size={18} />
              <span>Filters</span>
              {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              {hasActiveFilters && <span className="filter-badge">{Object.keys(filters).filter(k => filters[k] && filters[k] !== '' && k !== 'search').length}</span>}
            </button>
          )}
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="clear-filters-btn">
              <FiX size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>
      {isExpanded && children && (
        <div className="structure-filters-expanded">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onFilterChange: handleFilterChange,
                filters,
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

export default StructureFilters;