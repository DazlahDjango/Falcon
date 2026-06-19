// src/components/reviews/rating-scales/list/RatingScaleFilters.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const FILTER_CONFIG = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    key: 'min_levels',
    label: 'Min Levels',
    type: 'number',
    placeholder: 'Min levels',
  },
  {
    key: 'max_levels',
    label: 'Max Levels',
    type: 'number',
    placeholder: 'Max levels',
  },
  {
    key: 'date_from',
    label: 'Date From',
    type: 'date',
  },
  {
    key: 'date_to',
    label: 'Date To',
    type: 'date',
  },
];

const RatingScaleFilters = ({ onFilterChange, onClearAll }) => {
  const handleFilterChange = useCallback(
    (key, value) => {
      if (onFilterChange) {
        onFilterChange(key, value);
      }
    },
    [onFilterChange]
  );

  const handleClear = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    }
  }, [onClearAll]);

  return (
    <div className="rating-scale-filters">
      {FILTER_CONFIG.map((filter) => (
        <div key={filter.key} className="filter-group">
          <label htmlFor={filter.key} className="filter-label">
            {filter.label}
          </label>
          {filter.type === 'select' && (
            <select
              id={filter.key}
              className="filter-input filter-select"
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <option value="">All {filter.label}</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {filter.type === 'number' && (
            <input
              id={filter.key}
              type="number"
              className="filter-input"
              placeholder={filter.placeholder}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            />
          )}
          {filter.type === 'date' && (
            <input
              id={filter.key}
              type="date"
              className="filter-input"
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            />
          )}
        </div>
      ))}
      <button className="filter-clear-btn" onClick={handleClear} title="Clear all filters">
        <X size={16} />
      </button>
    </div>
  );
};

RatingScaleFilters.propTypes = {
  onFilterChange: PropTypes.func,
  onClearAll: PropTypes.func,
};

export default RatingScaleFilters;