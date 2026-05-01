import React from 'react';
import { Users, UserCheck, TrendingUp, Calendar } from 'lucide-react';

const TeamStats = ({ team, memberCount = 0, className = '' }) => {
  if (!team) return null;

  const utilization = team.max_members ? Math.round((memberCount / team.max_members) * 100) : null;
  const hasTeamLead = !!team.team_lead;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Users size={16} />
          <span className="text-xs">Members</span>
        </div>
        <div className="text-2xl font-semibold">{memberCount}</div>
        {team.max_members && (
          <div className="text-xs text-gray-400">Limit: {team.max_members}</div>
        )}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <TrendingUp size={16} />
          <span className="text-xs">Utilization</span>
        </div>
        <div className="text-2xl font-semibold">
          {utilization !== null ? `${utilization}%` : 'N/A'}
        </div>
        {utilization !== null && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                utilization > 90 ? 'bg-red-500' : utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <UserCheck size={16} />
          <span className="text-xs">Team Lead</span>
        </div>
        <div className="text-lg font-medium">
          {hasTeamLead ? 'Assigned' : 'Not Assigned'}
        </div>
        {hasTeamLead && team.team_lead_name && (
          <div className="text-xs text-gray-500 truncate">{team.team_lead_name}</div>
        )}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Calendar size={16} />
          <span className="text-xs">Created</span>
        </div>
        <div className="text-sm font-medium">
          {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
        </div>
        <div className="text-xs text-gray-400">
          {team.created_by ? `by ${team.created_by}` : ''}
        </div>
      </div>
    </div>
  );
};
export default TeamStats;