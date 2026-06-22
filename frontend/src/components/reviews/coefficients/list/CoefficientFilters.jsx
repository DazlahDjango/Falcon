// src/components/reviews/coefficients/list/CoefficientFilters.jsx
import React from 'react';

const CoefficientFilters = ({ onFilterChange, onClearAll }) => {
  const filters = [
    {
      key: 'coefficient_type',
      label: 'Type',
      options: [
        { value: '', label: 'All Types' },
        { value: 'individual', label: 'Individual' },
        { value: 'department', label: 'Department' },
        { value: 'position', label: 'Position' },
      ],
    },
    {
      key: 'is_active',
      label: 'Status',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
    {
      key: 'min_value',
      label: 'Min Value',
      type: 'number',
      placeholder: 'Min',
    },
    {
      key: 'max_value',
      label: 'Max Value',
      type: 'number',
      placeholder: 'Max',
    },
  ];

  return (
    <div className="coefficient-filters">
      {filters.map((filter) => (
        filter.type === 'number' ? (
          <input
            key={filter.key}
            type="number"
            className="coefficient-filter-input"
            placeholder={filter.placeholder}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            step="0.01"
          />
        ) : (
          <select
            key={filter.key}
            className="coefficient-filter-select"
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      ))}
      <button className="coefficient-filter-clear" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default CoefficientFilters;