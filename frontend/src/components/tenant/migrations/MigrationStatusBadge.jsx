// components/tenant/migrations/MigrationStatusBadge.jsx
import React from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiRefreshCw, FiAlertTriangle, FiRotateCcw } from 'react-icons/fi';

const MigrationStatusBadge = ({ status }) => {
  const statusMap = {
    PENDING: { label: 'Pending', className: 'migration-badge-yellow', icon: FiClock },
    RUNNING: { label: 'Running', className: 'migration-badge-blue', icon: FiRefreshCw },
    COMPLETED: { label: 'Completed', className: 'migration-badge-green', icon: FiCheckCircle },
    FAILED: { label: 'Failed', className: 'migration-badge-red', icon: FiXCircle },
    ROLLED_BACK: { label: 'Rolled Back', className: 'migration-badge-orange', icon: FiRotateCcw },
  };
  const config = statusMap[status] || { label: status, className: 'migration-badge-gray', icon: FiAlertTriangle };
  const Icon = config.icon;
  return (
    <span className={`migration-badge ${config.className}`}>
      <Icon size={14} style={{ marginRight: '4px' }} />
      {config.label}
    </span>
  );
};

export default MigrationStatusBadge;