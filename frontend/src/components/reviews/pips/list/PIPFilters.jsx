// src/components/reviews/pips/list/PIPFilters.jsx
const PIPFilters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All' },
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Active' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'severity',
    label: 'Severity',
    type: 'select',
    options: [
      { value: '', label: 'All' },
      { value: 'minor', label: 'Minor' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' },
      { value: 'critical', label: 'Critical' },
    ],
  },
  {
    key: 'outcome',
    label: 'Outcome',
    type: 'select',
    options: [
      { value: '', label: 'All' },
      { value: 'successful', label: 'Successful' },
      { value: 'extended', label: 'Extended' },
      { value: 'failed', label: 'Failed' },
      { value: 'terminated', label: 'Terminated' },
      { value: 'resigned', label: 'Resigned' },
    ],
  },
  {
    key: 'is_overdue',
    label: 'Overdue',
    type: 'select',
    options: [
      { value: '', label: 'All' },
      { value: 'true', label: 'Overdue' },
      { value: 'false', label: 'On Track' },
    ],
  },
];

export default PIPFilters;