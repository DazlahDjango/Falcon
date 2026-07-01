import React from 'react';
import { FiMail, FiBriefcase, FiMapPin, FiCalendar } from 'react-icons/fi';
import { UserAvatar } from '../common/UserAvatar';
import { UserRoleBadge } from '../users/UserRoleBadge';
import { UserStatusBadge } from '../users/UserStatusBadge';

export const ProfileCard = ({ profile, onClick, compact = false }) => {
  const user = profile?.user || profile;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (compact) {
    return (
      <div className="profile-card-compact" onClick={() => onClick && onClick(profile)}>
        <UserAvatar user={user} size="md" />
        <div className="profile-card-info">
          <span className="profile-card-name">
            {user?.full_name || user?.first_name || user?.email}
          </span>
          <span className="profile-card-email">
            <FiMail /> {user?.email}
          </span>
        </div>
        <UserRoleBadge role={user?.role} size="sm" />
      </div>
    );
  }

  return (
    <div className="profile-card-full" onClick={() => onClick && onClick(profile)}>
      <div className="profile-card-header">
        <UserAvatar user={user} size="lg" />
        <div className="profile-card-status">
          <UserStatusBadge
            isActive={user?.is_active !== false}
            isVerified={user?.is_verified === true}
          />
        </div>
      </div>

      <div className="profile-card-body">
        <h3 className="profile-card-name">
          {user?.full_name || user?.first_name || user?.email}
        </h3>
        <p className="profile-card-email">
          <FiMail /> {user?.email}
        </p>
        <div className="profile-card-role">
          <UserRoleBadge role={user?.role} />
        </div>

        <div className="profile-card-details">
          {profile?.department && (
            <span><FiBriefcase /> {profile.department}</span>
          )}
          {profile?.title && (
            <span><FiBriefcase /> {profile.title}</span>
          )}
          {profile?.city && profile?.country && (
            <span><FiMapPin /> {profile.city}, {profile.country}</span>
          )}
          {user?.created_at && (
            <span><FiCalendar /> Joined {formatDate(user.created_at)}</span>
          )}
        </div>
      </div>

      {profile?.bio && (
        <div className="profile-card-bio">
          <p>{profile.bio}</p>
        </div>
      )}
    </div>
  );
};
export default ProfileCard;