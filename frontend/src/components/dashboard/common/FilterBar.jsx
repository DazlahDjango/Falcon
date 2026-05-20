import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

export const FilterBar = ({ filters, onFilterChange, className = '', showSearch = true }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  const handleChange = useCallback((key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  }, [localFilters, onFilterChange]);

  const clearFilters = useCallback(() => {
    setLocalFilters({});
    onFilterChange({});
  }, [onFilterChange]);

  const filterConfigs = {
    period: {
      label: 'Period',
      type: 'select',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' }
      ]
    },
    department: {
      label: 'Department',
      type: 'select',
      options: []
    },
    status: {
      label: 'Status',
      type: 'select',
      options: [
        { value: 'green', label: 'On Track' },
        { value: 'yellow', label: 'At Risk' },
        { value: 'red', label: 'Off Track' }
      ]
    },
    category: {
      label: 'Category',
      type: 'select',
      options: []
    }
  };

  const hasActiveFilters = Object.keys(localFilters).length > 0;

  return (
    <div className={`filter-bar ${className}`} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
      {showSearch && (
        <div className="filter-search" style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search..."
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
          />
        </div>
      )}
      
      {Object.entries(filterConfigs).map(([key, config]) => {
        if (config.options.length === 0 && key !== 'period') return null;
        
        return (
          <div key={key} className="filter-item">
            <select
              value={localFilters[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white' }}
            >
              <option value="">All {config.label}s</option>
              {config.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      })}
      
      {hasActiveFilters && (
        <button 
          onClick={clearFilters}
          style={{ padding: '8px 12px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
        >
          Clear All
        </button>
      )}
    </div>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  showSearch: PropTypes.bool
};