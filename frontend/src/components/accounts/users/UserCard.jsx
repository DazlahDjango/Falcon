import React from 'react';
import { FiMail, FiShield, FiCalendar, FiClock } from 'react-icons/fi';
import { UserAvatar } from '../common/UserAvatar';
import { UserStatusBadge } from './UserStatusBadge';
import { UserRoleBadge } from './UserRoleBadge';

export const UserCard = ({ user, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="user-card" onClick={() => onClick && onClick(user)}>
      <div className="user-card-header">
        <UserAvatar user={user} size="lg" />
        <div className="user-card-status">
          <UserStatusBadge
            isActive={user.is_active !== false}
            isVerified={user.is_verified === true}
          />
        </div>
      </div>

      <div className="user-card-body">
        <h3 className="user-card-name">
          {user.full_name || user.first_name || user.email}
        </h3>
        <p className="user-card-email">
          <FiMail className="card-icon" />
          {user.email}
        </p>
        <div className="user-card-role">
          <UserRoleBadge role={user.role} />
        </div>
        <div className="user-card-meta">
          <span className="meta-item">
            <FiShield className="meta-icon" />
            MFA: {user.mfa_enabled ? 'Enabled' : 'Disabled'}
          </span>
          <span className="meta-item">
            <FiClock className="meta-icon" />
            Joined: {formatDate(user.created_at)}
          </span>
          <span className="meta-item">
            <FiCalendar className="meta-icon" />
            Last Login: {formatDate(user.last_login)}
          </span>
        </div>
      </div>

      <div className="user-card-footer">
        <span className="user-card-department">
          {user.department || 'No Department'}
        </span>
        <span className="user-card-title">
          {user.title || 'No Title'}
        </span>
      </div>
    </div>
  );
};
export default UserCard;