// src/components/reviews/feedback/requests/FeedbackRequestFilters.jsx
import React from 'react';

const FeedbackRequestFilters = ({ onFilterChange, onClearAll }) => {
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All' },
        { value: 'draft', label: 'Pending' },
        { value: 'submitted', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'reviewer_type',
      label: 'Reviewer Type',
      options: [
        { value: '', label: 'All' },
        { value: 'manager', label: 'Manager' },
        { value: 'peer', label: 'Peer' },
        { value: 'subordinate', label: 'Subordinate' },
        { value: 'cross_dept', label: 'Cross-Department' },
        { value: 'external', label: 'External' },
      ],
    },
    {
      key: 'is_anonymous',
      label: 'Anonymous',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    {
      key: 'is_required',
      label: 'Required',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
  ];

  return (
    <div className="feedback-request-filters">
      {filters.map((filter) => (
        <select
          key={filter.key}
          className="feedback-request-filter-select"
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      <button className="feedback-request-filter-clear" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default FeedbackRequestFilters;