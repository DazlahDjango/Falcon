import React from 'react';

const TeamCard = ({ team, onEdit, onDelete, onViewMembers }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-md font-semibold text-gray-900">{team.name}</h3>
          <p className="text-sm text-gray-500">{team.department_name || 'No Department'}</p>
          {team.description && (
            <p className="text-sm text-gray-500 mt-1">{team.description}</p>
          )}
          <div className="mt-2 flex items-center space-x-3 text-xs text-gray-400">
            {team.team_lead_name && (
              <span>👥 Lead: {team.team_lead_name}</span>
            )}
            {team.member_count !== undefined && (
              <span>👤 {team.member_count} members</span>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onViewMembers(team)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Members"
          >
            👥
          </button>
          <button
            onClick={() => onEdit(team)}
            className="p-1 text-indigo-600 hover:text-indigo-800"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(team)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;