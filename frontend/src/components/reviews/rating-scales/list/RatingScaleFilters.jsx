// src/components/reviews/rating-scales/list/RatingScaleFilters.jsx
const RatingScaleFilters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    key: 'min_levels',
    label: 'Min Levels',
    type: 'number',
    placeholder: 'Min levels',
  },
  {
    key: 'max_levels',
    label: 'Max Levels',
    type: 'number',
    placeholder: 'Max levels',
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

export default RatingScaleFilters;