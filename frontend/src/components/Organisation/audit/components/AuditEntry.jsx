import React, { useState } from 'react';

const AuditEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);

  const getActionIcon = (action) => {
    const icons = {
      created: '✅',
      updated: '✏️',
      deleted: '🗑️',
      activated: '▶️',
      suspended: '⏸️',
      subscription_changed: '💰',
      domain_added: '🌐',
      domain_verified: '✓',
      settings_changed: '⚙️',
      user_added: '👤',
      user_removed: '🚫',
    };
    return icons[action] || '📋';
  };

  const getActionColor = (action) => {
    const colors = {
      created: 'text-green-600',
      updated: 'text-blue-600',
      deleted: 'text-red-600',
      activated: 'text-green-600',
      suspended: 'text-yellow-600',
      subscription_changed: 'text-purple-600',
      domain_added: 'text-indigo-600',
      domain_verified: 'text-green-600',
      settings_changed: 'text-gray-600',
      user_added: 'text-blue-600',
      user_removed: 'text-red-600',
    };
    return colors[action] || 'text-gray-600';
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div 
        className="p-4 hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getActionIcon(entry.action)}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                  {entry.action?.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  {entry.object_repr || entry.model_name}
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs text-gray-400">
                  {entry.user_email || 'System'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
                {entry.ip_address && (
                  <span className="text-xs text-gray-400">
                    IP: {entry.ip_address}
                  </span>
                )}
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expanded && entry.changes && Object.keys(entry.changes).length > 0 && (
          <div className="mt-3 pl-8">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Changes:</p>
              <div className="space-y-1">
                {Object.entries(entry.changes).map(([field, change]) => (
                  <div key={field} className="text-xs">
                    <span className="font-mono text-gray-600">{field}:</span>
                    {change.old !== undefined && (
                      <span className="ml-2">
                        <span className="text-red-600 line-through">{String(change.old)}</span>
                        <span className="mx-1">→</span>
                        <span className="text-green-600">{String(change.new)}</span>
                      </span>
                    )}
                    {change.old === undefined && (
                      <span className="ml-2 text-green-600">{String(change.new)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditEntry;