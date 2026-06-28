// src/components/reviews/cycles/list/CycleFilters.jsx
const CycleFilters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'active', label: 'Active' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'completed', label: 'Completed' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    key: 'cycle_type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'annual', label: 'Annual' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'probation', label: 'Probation' },
      { value: 'special', label: 'Special' },
      { value: 'pip', label: 'PIP' },
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

export default CycleFilters;