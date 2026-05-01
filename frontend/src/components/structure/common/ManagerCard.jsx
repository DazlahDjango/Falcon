import React from 'react';
import EmployeeAvatar from './EmployeeAvatar';

const ManagerCard = ({ manager, onView, className = '' }) => {
  if (!manager) {
    return <div className="manager-card empty">No manager assigned</div>;
  }
  const directReportsCount = manager.direct_reports?.length || manager.direct_report_count || 0;
  const teamSize = manager.team_size || directReportsCount;
  return (
    <div className={`manager-card ${className}`} onClick={() => onView?.(manager)}>
      <div className="flex items-start gap-3">
        <EmployeeAvatar user={manager} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 truncate">
              {manager.name || manager.first_name ? `${manager.first_name} ${manager.last_name}` : manager.email}
            </h4>
            {manager.is_executive && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Executive</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{manager.position_title || manager.position?.title || 'Manager'}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>👥 {teamSize} team members</span>
            <span>📋 {directReportsCount} direct reports</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ManagerCard;