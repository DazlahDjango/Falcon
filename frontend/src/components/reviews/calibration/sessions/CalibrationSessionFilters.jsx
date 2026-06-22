// src/components/reviews/calibration/sessions/CalibrationSessionFilters.jsx
import React from 'react';

const CalibrationSessionFilters = ({ onFilterChange, onClearAll }) => {
  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All' },
        { value: 'draft', label: 'Draft' },
        { value: 'under_review', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'session_type',
      label: 'Type',
      options: [
        { value: '', label: 'All' },
        { value: 'initial', label: 'Initial' },
        { value: 'mid_cycle', label: 'Mid-Cycle' },
        { value: 'final', label: 'Final' },
        { value: 'adhoc', label: 'Ad-Hoc' },
      ],
    },
    {
      key: 'outcome',
      label: 'Outcome',
      options: [
        { value: '', label: 'All' },
        { value: 'completed', label: 'Completed' },
        { value: 'partial', label: 'Partial' },
        { value: 'cancelled', label: 'Cancelled' },
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
    <div className="calibration-session-filters">
      {filters.map((filter) => (
        filter.type === 'date' ? (
          <input
            key={filter.key}
            type="date"
            className="calibration-session-filter-input"
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={filter.label}
          />
        ) : (
          <select
            key={filter.key}
            className="calibration-session-filter-select"
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
      <button className="calibration-session-filter-clear" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default CalibrationSessionFilters;