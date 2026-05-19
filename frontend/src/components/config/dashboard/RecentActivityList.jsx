import { FiRefreshCw, FiHardDrive, FiShield, FiActivity, FiList } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_ICONS = {
  backup: FiHardDrive,
  maintenance: FiRefreshCw,
  disaster_recovery: FiShield,
  health: FiActivity,
  audit: FiList
};

const ACTIVITY_COLORS = {
  backup: 'text-blue-600 bg-blue-100',
  maintenance: 'text-orange-600 bg-orange-100',
  disaster_recovery: 'text-purple-600 bg-purple-100',
  health: 'text-green-600 bg-green-100',
  audit: 'text-gray-600 bg-gray-100'
};

export const RecentActivityList = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-100 rounded"></div>)}
        </div>
      </div>
    );
  }

  const allActivities = [
    ...(activities?.recentBackups || []).map(a => ({ ...a, type: 'backup' })),
    ...(activities?.recentMaintenance || []).map(a => ({ ...a, type: 'maintenance' })),
    ...(activities?.recentDR || []).map(a => ({ ...a, type: 'disaster_recovery' }))
  ].sort((a, b) => new Date(b.created_at || b.triggered_at) - new Date(a.created_at || a.triggered_at)).slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FiList className="text-gray-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        </div>
      </div>
      <div className="space-y-3">
        {allActivities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
        ) : (
          allActivities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type];
            const colorClass = ACTIVITY_COLORS[activity.type];
            const date = new Date(activity.created_at || activity.triggered_at || activity.performed_at);
            const timeAgo = formatDistanceToNow(date, { addSuffix: true });
            const title = activity.title || activity.name || `${activity.type} operation`;
            const status = activity.status || activity.result;

            return (
              <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{timeAgo}</span>
                    {status && (
                      <>
                        <span>•</span>
                        <span className={`capitalize ${status === 'completed' || status === 'success' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};