// src/components/reviews/competencies/list/CompetencyFilters.jsx
import React from 'react';

const CompetencyFilters = ({ onFilterChange, onClearAll }) => {
  const filters = [
    {
      key: 'competency_type',
      label: 'Type',
      options: [
        { value: '', label: 'All Types' },
        { value: 'leadership', label: 'Leadership' },
        { value: 'management', label: 'Management' },
        { value: 'technical', label: 'Technical' },
        { value: 'soft_skill', label: 'Soft Skill' },
        { value: 'cultural', label: 'Cultural' },
        { value: 'strategic', label: 'Strategic' },
        { value: 'operational', label: 'Operational' },
        { value: 'customer', label: 'Customer Focus' },
        { value: 'innovation', label: 'Innovation' },
        { value: 'teamwork', label: 'Teamwork' },
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
      key: 'is_required',
      label: 'Required',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Required' },
        { value: 'false', label: 'Optional' },
      ],
    },
  ];

  return (
    <div className="competency-filters">
      {filters.map((filter) => (
        <select
          key={filter.key}
          className="competency-filter-select"
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      <button className="competency-filter-clear" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  );
};

export default CompetencyFilters;