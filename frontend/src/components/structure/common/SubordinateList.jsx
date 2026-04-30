import React from 'react';
import EmployeeAvatar from './EmployeeAvatar';

const SubordinateList = ({ subordinates, onSelect, maxDisplay = 5, className = '' }) => {
  if (!subordinates || subordinates.length === 0) {
    return <div className="text-sm text-gray-500 italic">No direct reports</div>;
  }
  const displaySubordinates = subordinates.slice(0, maxDisplay);
  const remainingCount = subordinates.length - maxDisplay;
  return (
    <div className={`subordinate-list ${className}`}>
      {displaySubordinates.map((subordinate, index) => (
        <div
          key={subordinate.user_id || index}
          className="subordinate-item hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelect?.(subordinate)}
        >
          <div className="flex items-center gap-3">
            <EmployeeAvatar user={subordinate} size="sm" />
            <div>
              <div className="font-medium text-sm">
                {subordinate.name || subordinate.first_name ? `${subordinate.first_name} ${subordinate.last_name}` : subordinate.user_id}
              </div>
              <div className="text-xs text-gray-500">{subordinate.position_title || subordinate.position?.title}</div>
            </div>
          </div>
          {subordinate.is_manager && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Manager</span>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="text-center text-sm text-gray-500 pt-1">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
};
export default SubordinateList;