import React from 'react';
import { User, Crown, Calendar } from 'lucide-react';
import EmployeeAvatar from '../common/EmployeeAvatar';

const PositionIncumbents = ({ incumbents, onSelectUser, className = '' }) => {
  if (!incumbents || incumbents.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <User size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No current incumbents for this position</p>
        <p className="text-xs text-gray-400 mt-1">This position is vacant</p>
      </div>
    );
  }
  const isSingleIncumbent = incumbents.length === 1;

  return (
    <div className={`space-y-3 ${className}`}>
      {incumbents.map((incumbent, index) => (
        <div
          key={incumbent.user_id || index}
          onClick={() => onSelectUser?.(incumbent.user_id)}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <EmployeeAvatar user={incumbent} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {incumbent.name || incumbent.user_id}
              </span>
              {index === 0 && isSingleIncumbent && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown size={10} /> Primary
                </span>
              )}
              {incumbent.is_manager && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Manager</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {incumbent.department && (
                <span>{incumbent.department}</span>
              )}
              {incumbent.effective_from && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  Since {new Date(incumbent.effective_from).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default PositionIncumbents;