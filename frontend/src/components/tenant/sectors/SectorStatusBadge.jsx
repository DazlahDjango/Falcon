// components/tenant/sectors/SectorStatusBadge.jsx
import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const SectorStatusBadge = ({ isActive }) => {
  if (isActive) {
    return (
      <span className="sector-badge sector-badge-green">
        <FiCheckCircle size={14} style={{ marginRight: '4px' }} />
        Active
      </span>
    );
  }
  return (
    <span className="sector-badge sector-badge-gray">
      <FiXCircle size={14} style={{ marginRight: '4px' }} />
      Inactive
    </span>
  );
};

export default SectorStatusBadge;