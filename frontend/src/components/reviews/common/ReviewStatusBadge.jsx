// src/components/reviews/common/ReviewStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';

const statusColorMap = {
  draft: 'badge-secondary',
  pending: 'badge-warning',
  submitted: 'badge-info',
  under_review: 'badge-info',
  in_progress: 'badge-info',
  approved: 'badge-success',
  rejected: 'badge-danger',
  completed: 'badge-success',
  locked: 'badge-success',
  calibrated: 'badge-primary',
  archived: 'badge-dark',
  cancelled: 'badge-danger',
  active: 'badge-success',
  successful: 'badge-success',
  failed: 'badge-danger',
  extended: 'badge-warning',
  terminated: 'badge-danger',
  resigned: 'badge-secondary',
  on_hold: 'badge-warning',
  high: 'badge-danger',
  medium: 'badge-warning',
  low: 'badge-success',
  minor: 'badge-info',
  moderate: 'badge-warning',
  severe: 'badge-danger',
  critical: 'badge-danger',
  not_started: 'badge-secondary',
  complete: 'badge-success',
  passed: 'badge-success',
  needs_attention: 'badge-danger',
  behind_schedule: 'badge-warning',
  on_track: 'badge-success',
};

const statusLabelMap = {
  draft: 'Draft',
  pending: 'Pending',
  submitted: 'Submitted',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  locked: 'Locked',
  calibrated: 'Calibrated',
  archived: 'Archived',
  cancelled: 'Cancelled',
  active: 'Active',
  successful: 'Successful',
  failed: 'Failed',
  extended: 'Extended',
  terminated: 'Terminated',
  resigned: 'Resigned',
  on_hold: 'On Hold',
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
  minor: 'Minor',
  moderate: 'Moderate',
  severe: 'Severe',
  critical: 'Critical',
  not_started: 'Not Started',
  complete: 'Complete',
  passed: 'Passed',
  needs_attention: 'Needs Attention',
  behind_schedule: 'Behind Schedule',
  on_track: 'On Track',
};

const ReviewStatusBadge = ({
  status,
  label,
  size = 'md',
  className = '',
  showIcon = true,
}) => {
  const badgeClass = statusColorMap[status] || 'badge-secondary';
  const displayLabel = label || statusLabelMap[status] || status;

  return (
    <span className={`badge ${badgeClass} badge-${size} ${className}`}>
      {showIcon && <span className="badge-dot"></span>}
      {displayLabel}
    </span>
  );
};

ReviewStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  showIcon: PropTypes.bool,
};

export default ReviewStatusBadge;