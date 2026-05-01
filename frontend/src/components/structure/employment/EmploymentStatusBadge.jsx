import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const EmploymentStatusBadge = ({ employment, className = '' }) => {
  const getStatusConfig = () => {
    if (!employment.is_active) {
      return { label: 'Inactive', icon: <XCircle size={12} />, class: 'status-inactive' };
    }
    if (employment.is_current) {
      return { label: 'Active', icon: <CheckCircle size={12} />, class: 'status-active' };
    }
    if (employment.effective_from && new Date(employment.effective_from) > new Date()) {
      return { label: 'Future', icon: <Clock size={12} />, class: 'status-inactive' };
    }
    if (employment.effective_to && new Date(employment.effective_to) < new Date()) {
      return { label: 'Expired', icon: <AlertCircle size={12} />, class: 'status-suspended' };
    }
    return { label: 'Pending', icon: <Clock size={12} />, class: 'status-on-leave' };
  };
  const config = getStatusConfig();
  return (
    <span className={`employment-status-badge ${config.class} ${className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};
export default EmploymentStatusBadge;