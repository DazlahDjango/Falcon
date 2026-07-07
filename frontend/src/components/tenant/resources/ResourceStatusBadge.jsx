// components/tenant/resources/ResourceStatusBadge.jsx
import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const ResourceStatusBadge = ({ resource }) => {
  const percentage = resource?.percentage_used || 0;
  const isExceeded = resource?.is_exceeded || false;
  const isWarning = resource?.is_warning || false;

  if (isExceeded) {
    return (
      <span className="resource-badge resource-badge-red">
        <FiXCircle size={14} style={{ marginRight: '4px' }} />
        Exceeded
      </span>
    );
  }
  if (isWarning) {
    return (
      <span className="resource-badge resource-badge-yellow">
        <FiAlertTriangle size={14} style={{ marginRight: '4px' }} />
        Warning
      </span>
    );
  }
  return (
    <span className="resource-badge resource-badge-green">
      <FiCheckCircle size={14} style={{ marginRight: '4px' }} />
      Healthy
    </span>
  );
};

export default ResourceStatusBadge;