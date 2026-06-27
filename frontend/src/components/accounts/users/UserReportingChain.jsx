import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiChevronRight,
  FiChevronDown,
  FiUsers,
} from 'react-icons/fi';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { UserAvatar } from '../common/UserAvatar';
import { UserRoleBadge } from './UserRoleBadge';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const UserReportingChain = ({ userId }) => {
  const navigate = useNavigate();
  const { getReportingChain, reportingChain, isLoading } = useUsers();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (userId) {
      getReportingChain(userId);
    }
  }, [userId, getReportingChain]);

  const renderChainNode = (node, index) => {
    const isLast = index === reportingChain.length - 1;
    const user = node.user || node;

    return (
      <div key={user.id || index} className="chain-node">
        <div className="chain-connector">
          {!isLast && <div className="chain-line" />}
          {!isLast && <FiChevronDown className="chain-arrow" />}
        </div>
        <div
          className="chain-user"
          onClick={() => navigate(ACCOUNTS_ROUTES.USER_DETAIL(user.id))}
        >
          <UserAvatar user={user} size="md" />
          <div className="chain-user-info">
            <span className="chain-user-name">
              {user.full_name || user.first_name || user.email}
            </span>
            <span className="chain-user-email">
              <FiMail /> {user.email}
            </span>
            <div className="chain-user-role">
              <UserRoleBadge role={user.role} size="sm" />
              {index === 0 && <span className="chain-badge current">Current</span>}
            </div>
          </div>
          <FiChevronRight className="chain-arrow-right" />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="chain-loading">
        <div className="spinner-sm" />
        <span>Loading reporting chain...</span>
      </div>
    );
  }

  if (!reportingChain || reportingChain.length === 0) {
    return (
      <div className="chain-empty">
        <FiUsers className="empty-icon" />
        <p>No reporting chain found</p>
      </div>
    );
  }

  return (
    <div className="chain-container">
      <div className="chain-header">
        <h3>
          <FiUsers /> Reporting Chain
        </h3>
        <button className="chain-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {expanded && (
        <div className="chain-tree">
          {reportingChain.map((node, index) => renderChainNode(node, index))}
        </div>
      )}
    </div>
  );
};
export default UserReportingChain;