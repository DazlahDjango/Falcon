import React from 'react';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

export const UserStatusBadge = ({ isActive, isVerified, size = 'sm' }) => {
  const getStatus = () => {
    if (!isActive) return { label: 'Inactive', icon: FiXCircle, color: 'inactive' };
    if (!isVerified) return { label: 'Unverified', icon: FiClock, color: 'warning' };
    return { label: 'Active', icon: FiCheckCircle, color: 'active' };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <span className={`user-status-badge ${status.color} ${size}`}>
      <Icon className="status-icon" />
      {status.label}
    </span>
  );
};
export default UserStatusBadge;