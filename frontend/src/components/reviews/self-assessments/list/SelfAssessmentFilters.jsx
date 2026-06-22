// src/components/reviews/self-assessments/list/SelfAssessmentFilters.jsx
const SelfAssessmentFilters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Submitted' },
    ],
  },
  {
    key: 'cycle_id',
    label: 'Review Cycle',
    type: 'select',
    options: [], // Will be populated dynamically
  },
  {
    key: 'is_late',
    label: 'Late',
    type: 'select',
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ],
  },
];

export default SelfAssessmentFilters;