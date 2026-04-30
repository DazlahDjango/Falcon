import React from 'react';
import { DEPARTMENT_SENSITIVITY, DEPARTMENT_SENSITIVITY_LABELS } from '../../../config/constants/structureConstants';

const DepartmentBadge = ({ department, size = 'md', showCode = true, className = '' }) => {
  const getSensitivityClass = () => {
    switch (department?.sensitivity_level) {
      case DEPARTMENT_SENSITIVITY.PUBLIC:
        return 'badge-department';
      case DEPARTMENT_SENSITIVITY.CONFIDENTIAL:
        return 'badge-department-confidential';
      case DEPARTMENT_SENSITIVITY.RESTRICTED:
        return 'badge-department-restricted';
      default:
        return 'badge-department';
    }
  };
  const sizeClass = {
    sm: 'structure-badge-sm',
    md: '',
    lg: 'structure-badge-lg',
  }[size];
  if (!department) {
    return <span className={`structure-badge ${sizeClass} ${className}`}>N/A</span>;
  }
  return (
    <span className={`structure-badge ${getSensitivityClass()} ${sizeClass} ${className}`}>
      {showCode && <span className="font-mono">{department.code}</span>}
      {showCode && department.name && <span className="mx-0.5">•</span>}
      <span>{department.name}</span>
    </span>
  );
};

export default DepartmentBadge;