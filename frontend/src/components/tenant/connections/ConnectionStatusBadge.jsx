// components/tenant/connections/ConnectionStatusBadge.jsx
import React from 'react';
import { FiZap, FiClock, FiX, FiAlertCircle } from 'react-icons/fi';

const ConnectionStatusBadge = ({ status }) => {
  const statusMap = {
    ACTIVE: { label: 'Active', className: 'connection-badge-green', icon: FiZap },
    IDLE: { label: 'Idle', className: 'connection-badge-yellow', icon: FiClock },
    CLOSED: { label: 'Closed', className: 'connection-badge-gray', icon: FiX },
    ERROR: { label: 'Error', className: 'connection-badge-red', icon: FiAlertCircle },
  };
  const config = statusMap[status] || { label: status, className: 'connection-badge-gray', icon: FiAlertCircle };
  const Icon = config.icon;
  return (
    <span className={`connection-badge ${config.className}`}>
      <Icon size={14} style={{ marginRight: '4px' }} />
      {config.label}
    </span>
  );
};

export default ConnectionStatusBadge;