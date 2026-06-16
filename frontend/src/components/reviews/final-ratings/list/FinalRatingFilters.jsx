// src/components/reviews/final-ratings/list/FinalRatingFilters.jsx
import React from 'react';

const FinalRatingFilters = ({ onFilterChange, onClearAll }) => {
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'calibrated', label: 'Calibrated' },
        { value: 'approved', label: 'Approved' },
        { value: 'locked', label: 'Locked' },
      ],
    },
    {
      key: 'promotion_recommended',
      label: 'Promotion',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Recommended' },
        { value: 'false', label: 'Not Recommended' },
      ],
    },
    {
      key: 'pip_recommended',
      label: 'PIP',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Recommended' },
        { value: 'false', label: 'Not Recommended' },
      ],
    },
    {
      key: 'min_score',
      label: 'Min Score',
      type: 'number',
      placeholder: 'Min %',
    },
    {
      key: 'max_score',
      label: 'Max Score',
      type: 'number',
      placeholder: 'Max %',
    },
  ];

  return (
    <div className="final-rating-filters">
      {filters.map((filter) => (
        <div key={filter.key} className="final-rating-filter-group">
          {filter.type === 'number' ? (
            <input
              type="number"
              className="final-rating-filter-input"
              placeholder={filter.placeholder}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              min={0}
              max={100}
            />
          ) : (
            <select
              className="final-rating-filter-select"
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
      <button className="final-rating-filter-clear" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default FinalRatingFilters;