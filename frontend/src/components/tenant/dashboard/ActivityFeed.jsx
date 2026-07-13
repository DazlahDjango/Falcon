// components/tenant/dashboard/ActivityFeed.jsx
import React from 'react';
import { FiClock } from 'react-icons/fi';

const ActivityFeed = ({ activities, onViewAll }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="dashboard-card">
        <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>Recent Activity</h4>
        <p className="dashboard-text-sm dashboard-text-muted">No recent activity</p>
      </div>
    );
  }

  const getTimeAgo = (date) => {
    if (!date) return 'N/A';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  const activityIcons = {
    created: '📝',
    updated: '✏️',
    deleted: '🗑️',
    onboarded: '🚀',
    activated: '✅',
    suspended: '⛔',
    verified: '🔐',
    default: '📌',
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-flex-between dashboard-mb-4">
        <h4 className="dashboard-font-semibold dashboard-text-sm" style={{ color: '#0f172a' }}>Recent Activity</h4>
        {onViewAll && (
          <button className="dashboard-btn dashboard-btn-secondary dashboard-btn-sm" onClick={onViewAll}>
            View All
          </button>
        )}
      </div>
      <div className="dashboard-space-y-2">
        {activities.slice(0, 5).map((activity, index) => {
          const icon = activityIcons[activity.type] || activityIcons.default;
          return (
            <div key={index} className="dashboard-flex dashboard-gap-3" style={{ padding: '6px 0', borderBottom: index < activities.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: '16px' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div className="dashboard-text-sm" style={{ color: '#0f172a' }}>{activity.message}</div>
                <div className="dashboard-flex dashboard-gap-2 dashboard-mt-1">
                  <FiClock size={12} style={{ color: '#94a3b8' }} />
                  <span className="dashboard-text-xs dashboard-text-muted">{getTimeAgo(activity.timestamp || activity.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;