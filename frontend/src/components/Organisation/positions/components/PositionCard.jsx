import React from 'react';

const PositionCard = ({ position, onEdit, onDelete, onViewHierarchy }) => {
  const getLevelLabel = (level) => {
    const levels = {
      1: 'CEO / Executive',
      2: 'Executive / C-Suite',
      3: 'Director',
      4: 'Head of Department',
      5: 'Manager',
      6: 'Supervisor',
      7: 'Staff',
      8: 'Intern / Trainee',
    };
    return levels[level] || `Level ${level}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-md font-semibold text-gray-900">{position.title}</h3>
            {position.code && (
              <span className="text-xs text-gray-500">({position.code})</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{position.department_name || 'No Department'}</p>
          {position.job_description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{position.job_description}</p>
          )}
          <div className="mt-2 flex items-center space-x-3 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              position.is_management 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {position.is_management ? '👔 Management' : '👤 Non-Management'}
            </span>
            <span className="text-gray-400">📊 {getLevelLabel(position.level)}</span>
            {position.reports_to_name && (
              <span className="text-gray-400">📋 Reports to: {position.reports_to_name}</span>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onViewHierarchy(position)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Hierarchy"
          >
            🌳
          </button>
          <button
            onClick={() => onEdit(position)}
            className="p-1 text-indigo-600 hover:text-indigo-800"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(position)}
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

export default PositionCard;