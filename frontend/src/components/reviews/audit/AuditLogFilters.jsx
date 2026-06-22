// src/components/reviews/audit/AuditLogFilters.jsx
import React from 'react';

const AuditLogFilters = ({ onFilterChange, onClearAll }) => {
  const filters = [
    {
      key: 'action',
      label: 'Action',
      options: [
        { value: '', label: 'All Actions' },
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
        { value: 'approve', label: 'Approve' },
        { value: 'reject', label: 'Reject' },
        { value: 'submit', label: 'Submit' },
        { value: 'lock', label: 'Lock' },
        { value: 'calibrate', label: 'Calibrate' },
        { value: 'activate', label: 'Activate' },
        { value: 'deactivate', label: 'Deactivate' },
      ],
    },
    {
      key: 'model_name',
      label: 'Model',
      options: [
        { value: '', label: 'All Models' },
        { value: 'SelfAssessment', label: 'Self Assessment' },
        { value: 'SupervisorReview', label: 'Supervisor Review' },
        { value: 'FinalRating', label: 'Final Rating' },
        { value: 'PIP', label: 'PIP' },
        { value: 'PromotionRecommendation', label: 'Promotion' },
        { value: 'CalibrationSession', label: 'Calibration' },
        { value: 'ReviewCycle', label: 'Review Cycle' },
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
    <div className="audit-log-filters">
      {filters.map((filter) => (
        filter.type === 'date' ? (
          <input
            key={filter.key}
            type="date"
            className="audit-log-filter-input"
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={filter.label}
          />
        ) : (
          <select
            key={filter.key}
            className="audit-log-filter-select"
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
      <button className="audit-log-filter-clear" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default AuditLogFilters;