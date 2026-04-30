import React from 'react';
import { Users, UserCheck, TrendingUp } from 'lucide-react';
import TeamBadge from '../common/TeamBadge';

const TeamCard = ({ team, memberCount = 0, onClick, className = '' }) => {
  if (!team) return null;
  const utilization = team.max_members ? Math.round((memberCount / team.max_members) * 100) : null;

  return (
    <div className={`team-card ${className}`} onClick={() => onClick?.(team)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <TeamBadge team={team} size="lg" />
          {team.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{team.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {team.team_lead && <UserCheck size={14} className="text-green-500" title="Has Team Lead" />}
        </div>
      </div>
      <div className="team-stats">
        <div className="flex items-center gap-1 text-sm">
          <Users size={14} className="text-gray-400" />
          <span className="font-medium">{memberCount}</span>
          <span className="text-gray-500">members</span>
        </div>
        {team.max_members && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp size={14} className="text-gray-400" />
            <span className="font-medium">{utilization}%</span>
            <span className="text-gray-500">capacity</span>
          </div>
        )}
      </div>
      {utilization !== null && utilization > 90 && (
        <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
          <span>⚠️ Near capacity</span>
        </div>
      )}
    </div>
  );
};
export default TeamCard;