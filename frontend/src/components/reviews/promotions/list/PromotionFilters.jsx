// src/components/reviews/promotions/list/PromotionFilters.jsx
import React from 'react';

const PromotionFilters = ({ onFilterChange, onClearAll }) => {
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: '', label: 'All' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
        { value: 'urgent', label: 'Urgent' },
      ],
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

  return (
    <div className="promotion-filters">
      {filters.map((filter) => (
        filter.type === 'date' ? (
          <input
            key={filter.key}
            type="date"
            className="promotion-filter-input"
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={filter.label}
          />
        ) : (
          <select
            key={filter.key}
            className="promotion-filter-select"
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
      <button className="promotion-filter-clear" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default PromotionFilters;