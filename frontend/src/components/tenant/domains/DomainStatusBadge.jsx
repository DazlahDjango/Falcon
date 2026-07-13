// components/tenant/domains/DomainStatusBadge.jsx
import React from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiAlertTriangle, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const DomainStatusBadge = ({ status }) => {
  const statusMap = {
    ACTIVE: { label: 'Active', className: 'domain-badge-green', icon: FiCheckCircle },
    PENDING: { label: 'Pending', className: 'domain-badge-yellow', icon: FiClock },
    VERIFYING: { label: 'Verifying', className: 'domain-badge-blue', icon: FiRefreshCw },
    FAILED: { label: 'Failed', className: 'domain-badge-red', icon: FiXCircle },
    EXPIRED: { label: 'Expired', className: 'domain-badge-orange', icon: FiAlertTriangle },
    REMOVED: { label: 'Removed', className: 'domain-badge-gray', icon: FiTrash2 },
  };
  const config = statusMap[status] || { label: status, className: 'domain-badge-gray', icon: FiAlertTriangle };
  const Icon = config.icon;
  return (
    <span className={`domain-badge ${config.className}`}>
      <Icon size={14} style={{ marginRight: '4px' }} />
      {config.label}
    </span>
  );
};

export default DomainStatusBadge;