import React, { useState } from 'react';
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiUnlock,
  FiShield,
} from 'react-icons/fi';
import { UserStatusBadge } from './UserStatusBadge';
import { UserRoleBadge } from './UserRoleBadge';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../../hooks/accounts/useAuth';

export const UserTable = ({ users, isLoading, onRowClick }) => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuToggle = (userId, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="user-table-loading">
        <div className="spinner-sm" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>MFA</th>
            <th>Last Login</th>
            <th>Joined</th>
            <th className="actions-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="user-table-row"
              onClick={() => onRowClick && onRowClick(user)}
            >
              <td>
                <div className="user-cell">
                  <UserAvatar user={user} size="sm" />
                  <div className="user-cell-info">
                    <span className="user-cell-name">
                      {user.full_name || user.first_name || user.email}
                    </span>
                    <span className="user-cell-email">{user.email}</span>
                  </div>
                </div>
              </td>
              <td>
                <UserRoleBadge role={user.role} />
              </td>
              <td>
                <UserStatusBadge
                  isActive={user.is_active !== false}
                  isVerified={user.is_verified === true}
                />
              </td>
              <td>
                {user.mfa_enabled ? (
                  <span className="mfa-enabled">✓</span>
                ) : (
                  <span className="mfa-disabled">—</span>
                )}
              </td>
              <td>{formatDate(user.last_login)}</td>
              <td>{formatDate(user.created_at)}</td>
              <td className="actions-cell">
                <div className="action-menu">
                  <button
                    className="menu-trigger"
                    onClick={(e) => handleMenuToggle(user.id, e)}
                  >
                    <FiMoreVertical />
                  </button>
                  {activeMenu === user.id && (
                    <div className="menu-dropdown">
                      <button onClick={(e) => { e.stopPropagation(); onRowClick && onRowClick(user); }}>
                        <FiEdit /> View Details
                      </button>
                      {user.is_active !== false ? (
                        <button className="danger" onClick={(e) => { e.stopPropagation(); /* handle deactivate */ }}>
                          <FiUserX /> Deactivate
                        </button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); /* handle activate */ }}>
                          <FiUserCheck /> Activate
                        </button>
                      )}
                      {user.locked_until && (
                        <button onClick={(e) => { e.stopPropagation(); /* handle unlock */ }}>
                          <FiUnlock /> Unlock Account
                        </button>
                      )}
                      {(isAdmin() || isSuperAdmin) && (
                        <button onClick={(e) => { e.stopPropagation(); /* handle role assign */ }}>
                          <FiShield /> Assign Role
                        </button>
                      )}
                      <hr />
                      <button className="danger" onClick={(e) => { e.stopPropagation(); /* handle delete */ }}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default UserTable;