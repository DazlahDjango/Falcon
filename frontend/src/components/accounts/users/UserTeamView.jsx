import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUser, FiMail, FiChevronRight } from 'react-icons/fi';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { UserAvatar } from '../common/UserAvatar';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const UserTeamView = ({ userId }) => {
  const navigate = useNavigate();
  const { getUserTeam, userTeam, isLoading } = useUsers();

  useEffect(() => {
    if (userId) {
      getUserTeam(userId);
    }
  }, [userId, getUserTeam]);

  if (isLoading) {
    return (
      <div className="user-team-loading">
        <div className="spinner-sm" />
        <span>Loading team...</span>
      </div>
    );
  }

  if (!userTeam || userTeam.length === 0) {
    return (
      <div className="user-team-empty">
        <FiUsers className="empty-icon" />
        <p>No team members found</p>
      </div>
    );
  }

  return (
    <div className="user-team-container">
      <div className="user-team-header">
        <h3>
          <FiUsers /> Team Members ({userTeam.length})
        </h3>
      </div>
      <div className="user-team-list">
        {userTeam.map((member) => (
          <div
            key={member.id}
            className="team-member-item"
            onClick={() => navigate(ACCOUNTS_ROUTES.USER_DETAIL(member.id))}
          >
            <div className="team-member-info">
              <UserAvatar user={member} size="md" />
              <div className="team-member-details">
                <span className="team-member-name">
                  {member.full_name || member.first_name || member.email}
                </span>
                <span className="team-member-email">
                  <FiMail /> {member.email}
                </span>
                <div className="team-member-badges">
                  <UserRoleBadge role={member.role} size="sm" />
                  <UserStatusBadge
                    isActive={member.is_active !== false}
                    isVerified={member.is_verified === true}
                    size="sm"
                  />
                </div>
              </div>
            </div>
            <FiChevronRight className="team-member-arrow" />
          </div>
        ))}
      </div>
    </div>
  );
};
export default UserTeamView;