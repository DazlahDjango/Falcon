import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuditLogs } from '@/hooks/organisation';
import { useAuthContext } from '@/contexts/accounts/AuthContext';

const RecentActivityWidget = () => {
  const { isAuthenticated } = useAuthContext();
  const { logs: activities, loading, loadLogs } = useAuditLogs({ limit: 5, autoFetch: false });

  useEffect(() => {
    if (isAuthenticated) {
      loadLogs();
    }
  }, [isAuthenticated, loadLogs]);

  const getActivityIcon = (action) => {
    const icons = {
      created: '✅',
      updated: '✏️',
      deleted: '🗑️',
      activated: '▶️',
      suspended: '⏸️',
      subscription_changed: '💰',
      domain_added: '🌐',
      domain_verified: '✓',
    };
    return icons[action] || '📋';
  };

  const getActivityColor = (action) => {
    const colors = {
      created: 'text-green-600',
      updated: 'text-blue-600',
      deleted: 'text-red-600',
      activated: 'text-green-600',
      suspended: 'text-yellow-600',
      subscription_changed: 'text-purple-600',
    };
    return colors[action] || 'text-gray-600';
  };

  const dashboardActivities = activities?.results || activities || [];

  if (loading && dashboardActivities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <Link to="/organisation/audit" className="text-sm text-indigo-600 hover:text-indigo-900">
            View All →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {dashboardActivities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No recent activity</div>
        ) : (
          dashboardActivities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-xl">{getActivityIcon(activity.action)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className={`font-medium ${getActivityColor(activity.action)}`}>
                      {activity.action?.toUpperCase()}
                    </span>
                    {' '}
                    {activity.object_repr || activity.model_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.user_email || 'System'} •{' '}
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivityWidget;