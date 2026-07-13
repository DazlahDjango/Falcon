import React from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiArchive, FiAlertTriangle, FiLoader } from 'react-icons/fi';

const OrganizationStatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();
  const statusMap = {
    ACTIVE: { label: 'Active', className: 'org-badge-green', icon: FiCheckCircle },
    PENDING: { label: 'Pending', className: 'org-badge-yellow', icon: FiClock },
    PROVISIONING: { label: 'Provisioning', className: 'org-badge-blue', icon: FiLoader },
    SUSPENDED: { label: 'Suspended', className: 'org-badge-red', icon: FiXCircle },
    ARCHIVED: { label: 'Archived', className: 'org-badge-gray', icon: FiArchive },
    FAILED: { label: 'Failed', className: 'org-badge-red', icon: FiAlertTriangle },
  };
  const config = statusMap[normalized] || {
    label: status || 'Unknown',
    className: 'org-badge-gray',
    icon: FiAlertTriangle,
  };
  const Icon = config.icon;
  return (
    <span className={`org-badge ${config.className}`}>
      <Icon className="org-gap-2" size={14} />
      {config.label}
    </span>
  );
};

export default OrganizationStatusBadge;
