import React from 'react';
import { Building2, Users, Layers } from 'lucide-react';
import DepartmentBadge from '../common/DepartmentBadge';
import { DEPARTMENT_SENSITIVITY_COLORS } from '../../../config/constants/structureConstants';

const DepartmentCard = ({ department, onClick, className = '' }) => {
  if (!department) return null;
  const sensitivityColor = DEPARTMENT_SENSITIVITY_COLORS[department.sensitivity_level] || '#6b7280';
  return (
    <div className={`department-card ${className}`} onClick={() => onClick?.(department)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <DepartmentBadge department={department} size="lg" />
          {department.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{department.description}</p>
          )}
        </div>
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: sensitivityColor }}
          title={`Sensitivity: ${department.sensitivity_level}`}
        />
      </div>
      <div className="department-stats">
        <div className="department-stat">
          <div className="department-stat-value">{department.child_count || 0}</div>
          <div className="department-stat-label">Sub-departments</div>
        </div>
        <div className="department-stat">
          <div className="department-stat-value">{department.team_count || 0}</div>
          <div className="department-stat-label">Teams</div>
        </div>
        <div className="department-stat">
          <div className="department-stat-value">{department.employee_count || 0}</div>
          <div className="department-stat-label">Employees</div>
        </div>
      </div>
      {department.headcount_limit && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <Users size={12} />
          <span>Limit: {department.headcount_limit}</span>
        </div>
      )}
    </div>
  );
};

export default DepartmentCard;