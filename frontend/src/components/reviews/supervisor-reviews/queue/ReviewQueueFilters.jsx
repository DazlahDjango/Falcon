// src/components/reviews/supervisor-reviews/queue/ReviewQueueFilters.jsx
import React from 'react';

const ReviewQueueFilters = ({ onFilterChange }) => {
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'draft', label: 'Draft' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      key: 'has_self_assessment',
      label: 'Self Assessment',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Submitted' },
        { value: 'false', label: 'Pending' },
      ],
    },
    {
      key: 'overdue',
      label: 'Overdue',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Overdue' },
        { value: 'false', label: 'On Time' },
      ],
    },
  ];

  return (
    <div className="review-queue-filters">
      {filters.map((filter) => (
        <select
          key={filter.key}
          className="review-queue-filter-select"
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} {filter.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
};

export default ReviewQueueFilters;