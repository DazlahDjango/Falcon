import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionsWidget = () => {
  const actions = [
    { name: 'Add Department', icon: '🏢', path: '/organisation/departments', color: 'bg-blue-50 text-blue-700' },
    { name: 'Add Team', icon: '👥', path: '/organisation/teams', color: 'bg-green-50 text-green-700' },
    { name: 'Add Position', icon: '💺', path: '/organisation/positions', color: 'bg-purple-50 text-purple-700' },
    { name: 'Invite User', icon: '👤', path: '/organisation/users', color: 'bg-indigo-50 text-indigo-700' },
    { name: 'Add Domain', icon: '🌐', path: '/organisation/domains', color: 'bg-yellow-50 text-yellow-700' },
    { name: 'Customize Branding', icon: '🎨', path: '/organisation/branding', color: 'bg-pink-50 text-pink-700' },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.name}
              to={action.path}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${action.color} hover:opacity-80`}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsWidget;