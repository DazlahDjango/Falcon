// components/tenant/schemas/SchemaStatusBadge.jsx
import React from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiRefreshCw, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';

const SchemaStatusBadge = ({ status }) => {
  const statusMap = {
    ACTIVE: { label: 'Active', className: 'schema-badge-green', icon: FiCheckCircle },
    PENDING: { label: 'Pending', className: 'schema-badge-yellow', icon: FiClock },
    CREATING: { label: 'Creating', className: 'schema-badge-blue', icon: FiRefreshCw },
    MIGRATING: { label: 'Migrating', className: 'schema-badge-purple', icon: FiRefreshCw },
    FAILED: { label: 'Failed', className: 'schema-badge-red', icon: FiXCircle },
    DELETED: { label: 'Deleted', className: 'schema-badge-gray', icon: FiTrash2 },
  };
  const config = statusMap[status] || { label: status, className: 'schema-badge-gray', icon: FiAlertTriangle };
  const Icon = config.icon;
  return (
    <span className={`schema-badge ${config.className}`}>
      <Icon size={14} style={{ marginRight: '4px' }} />
      {config.label}
    </span>
  );
};

export default SchemaStatusBadge;