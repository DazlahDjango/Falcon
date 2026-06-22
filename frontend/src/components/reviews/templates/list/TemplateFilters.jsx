// src/components/reviews/templates/list/TemplateFilters.jsx
import React from 'react';

const TemplateFilters = ({ onFilterChange, onClearAll }) => {
  const filters = [
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
      key: 'is_default',
      label: 'Default',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Default' },
        { value: 'false', label: 'Custom' },
      ],
    },
    {
      key: 'applies_to_self_assessment',
      label: 'Self Assessment',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    {
      key: 'applies_to_supervisor_review',
      label: 'Supervisor Review',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    {
      key: 'applies_to_360_feedback',
      label: '360 Feedback',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
  ];

  return (
    <div className="template-filters">
      {filters.map((filter) => (
        <select
          key={filter.key}
          className="template-filter-select"
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      <button className="template-filter-clear" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default TemplateFilters;