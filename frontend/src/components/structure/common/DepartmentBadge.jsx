import React from 'react';
import { DEPARTMENT_SENSITIVITY } from '../../../config/constants/structureConstants';

const DepartmentBadge = ({ department, size = 'md', showCode = true, className = '' }) => {
  if (!department) {
    return <span className={`structure-badge badge-department ${className}`}>N/A</span>;
  }

  const sensitivityLevel = typeof department === 'object' ? department.sensitivity_level : null;
  const deptName = typeof department === 'object' ? (department.name || department.code || '') : String(department);
  const deptCode = typeof department === 'object' ? department.code : null;

  const getSensitivityClass = () => {
    switch (sensitivityLevel) {
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
  }[size] || '';

  return (
    <span className={`structure-badge ${getSensitivityClass()} ${sizeClass} ${className}`}>
      {showCode && deptCode && <span className="font-mono">{deptCode}</span>}
      {showCode && deptCode && deptName && <span className="mx-0.5">•</span>}
      <span>{deptName}</span>
    </span>
  );
};

export default DepartmentBadge;
