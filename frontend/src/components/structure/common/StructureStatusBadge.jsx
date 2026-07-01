import React from 'react';

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    className: 'badge-success',
    icon: '●',
  },
  inactive: {
    label: 'Inactive',
    className: 'badge-danger',
    icon: '●',
  },
  pending: {
    label: 'Pending',
    className: 'badge-warning',
    icon: '●',
  },
  archived: {
    label: 'Archived',
    className: 'badge-secondary',
    icon: '●',
  },
  published: {
    label: 'Published',
    className: 'badge-primary',
    icon: '●',
  },
  draft: {
    label: 'Draft',
    className: 'badge-light',
    icon: '●',
  },
  approved: {
    label: 'Approved',
    className: 'badge-success',
    icon: '●',
  },
  rejected: {
    label: 'Rejected',
    className: 'badge-danger',
    icon: '●',
  },
  submitted: {
    label: 'Submitted',
    className: 'badge-info',
    icon: '●',
  },
  locked: {
    label: 'Locked',
    className: 'badge-dark',
    icon: '●',
  },
};

export const StructureStatusBadge = ({
  status,
  customLabel = null,
  className = '',
  size = 'md',
}) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    className: 'badge-secondary',
    icon: '●',
  };

  const sizeClass = `badge-${size}`;

  return (
    <span className={`structure-badge ${config.className} ${sizeClass} ${className}`}>
      <span className="badge-icon">{config.icon}</span>
      {customLabel || config.label}
    </span>
  );
};

export default StructureStatusBadge;