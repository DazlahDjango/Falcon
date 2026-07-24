import React from 'react';
import { GENERATION_STATUS_DISPLAY } from '../../../config/constants';

export const ReportStatusBadge = ({ status }) => {
  const normalized = status ? status.toLowerCase() : 'pending';
  const displayLabel = GENERATION_STATUS_DISPLAY[normalized] || status;

  return (
    <span className={`reporting-badge reporting-badge-${normalized}`}>
      {displayLabel}
    </span>
  );
};

export default ReportStatusBadge;
