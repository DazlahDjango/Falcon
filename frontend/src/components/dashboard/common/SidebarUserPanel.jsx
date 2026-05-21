import React from 'react';
import { FiUser } from 'react-icons/fi';

/**
 * Shared footer user block for all dashboard sidebars (accounts profile).
 */
export const SidebarUserPanel = ({ user, isCollapsed, wsConnected }) => {
  if (!user) return null;

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || (user.email?.[0]?.toUpperCase() ?? '?');

  return (
    <div className={`dashboard-sidebar-user ${isCollapsed ? 'dashboard-sidebar-user--collapsed' : ''}`}>
      <div className="dashboard-sidebar-user__avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {!isCollapsed && (
        <div className="dashboard-sidebar-user__meta">
          <div className="dashboard-sidebar-user__name">{user.fullName}</div>
          <div className="dashboard-sidebar-user__role">{user.title || user.role}</div>
          <span
            className={`dashboard-sidebar-user__live ${wsConnected ? 'dashboard-sidebar-user__live--on' : ''}`}
            title={wsConnected ? 'Live updates' : 'Reconnecting…'}
          >
            {wsConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      )}
      {isCollapsed && (
        <FiUser className="dashboard-sidebar-user__icon-collapsed" title={user.fullName} />
      )}
    </div>
  );
};

export default SidebarUserPanel;
