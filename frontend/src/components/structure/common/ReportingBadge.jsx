import React from 'react';
import { REPORTING_RELATION_TYPE, REPORTING_RELATION_TYPE_LABELS } from '../../../config/constants/structureConstants';

const ReportingBadge = ({ reportingLine, size = 'md', showWeight = false, className = '' }) => {
  const sizeClass = {
    sm: 'structure-badge-sm',
    md: '',
    lg: 'structure-badge-lg',
  }[size];
  const getRelationClass = () => {
    switch (reportingLine?.relation_type) {
      case REPORTING_RELATION_TYPE.SOLID:
        return 'badge-reporting-solid';
      case REPORTING_RELATION_TYPE.DOTTED:
        return 'badge-reporting-dotted';
      case REPORTING_RELATION_TYPE.INTERIM:
        return 'badge-reporting-interim';
      default:
        return 'badge-reporting-solid';
    }
  };
  if (!reportingLine) {
    return null;
  }
  const label = REPORTING_RELATION_TYPE_LABELS[reportingLine.relation_type] || reportingLine.relation_type;
  return (
    <span className={`structure-badge ${getRelationClass()} ${sizeClass} ${className}`}>
      <span>{label}</span>
      {showWeight && reportingLine.reporting_weight !== undefined && (
        <>
          <span className="mx-0.5">•</span>
          <span className="text-xs">{Math.round(reportingLine.reporting_weight * 100)}%</span>
        </>
      )}
    </span>
  );
};
export default ReportingBadge;