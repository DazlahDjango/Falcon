import React from 'react';
import EmployeeAvatar from '../common/EmployeeAvatar';
import { UserMinus, Crown } from 'lucide-react';

const TeamMembersList = ({ members, onRemoveMember, canRemove = false, className = '' }) => {
  if (!members || members.length === 0) {
    return <div className="text-center text-gray-500 py-4">No members in this team</div>;
  }
  
  return (
    <div className={`team-members-list ${className}`}>
      {members.map((member) => (
        <div key={member.user_id} className="team-member-item">
          <div className="flex items-center gap-3">
            <EmployeeAvatar user={member} size="sm" />
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                {member.user_id}
                {member.is_team_lead && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Crown size={10} /> Lead
                  </span>
                )}
                {member.is_manager && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Manager</span>
                )}
              </div>
              <div className="text-xs text-gray-500">{member.position_title || 'No position'}</div>
            </div>
          </div>
          {canRemove && !member.is_team_lead && (
            <button
              onClick={() => onRemoveMember?.(member.user_id)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Remove from team"
            >
              <UserMinus size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeamMembersList;