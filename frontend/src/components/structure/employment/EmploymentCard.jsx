import React from 'react';
import { Calendar, Briefcase, Building2, Users } from 'lucide-react';
import PositionBadge from '../common/PositionBadge';
import DepartmentBadge from '../common/DepartmentBadge';
import TeamBadge from '../common/TeamBadge';
import EmploymentStatusBadge from './EmploymentStatusBadge';

const EmploymentCard = ({ employment, onSelect, className = '' }) => {
  if (!employment) return null;
  const isCurrent = employment.is_current && employment.is_active;

  return (
    <div
      className={`employment-card ${isCurrent ? 'employment-card-current' : 'employment-card-inactive'} ${className}`}
      onClick={() => onSelect?.(employment)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <PositionBadge position={employment.position} size="sm" />
            <EmploymentStatusBadge employment={employment} />
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 size={12} />
              <DepartmentBadge department={employment.department} size="sm" showCode={false} />
            </span>
            {employment.team && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                <TeamBadge team={employment.team} size="sm" showCode={false} />
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          {employment.employment_type}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>
            {employment.effective_from ? new Date(employment.effective_from).toLocaleDateString() : 'N/A'}
            {employment.effective_to && ` → ${new Date(employment.effective_to).toLocaleDateString()}`}
          </span>
        </div>
        {employment.is_manager && (
          <span className="text-blue-600 flex items-center gap-1">
            <Briefcase size={12} /> Manager
          </span>
        )}
      </div>
    </div>
  );
};

export default EmploymentCard;