import React, { useState } from 'react';
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiUnlock,
  FiShield,
  FiLock,
  FiCheck,
} from 'react-icons/fi';
import { UserStatusBadge } from './UserStatusBadge';
import { UserRoleBadge } from './UserRoleBadge';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { impersonateUser } from '../../../services/accounts/api/admin';

export const UserTable = ({ users, isLoading, onRowClick }) => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { activateUser, deactivateUser, unlockUser, verifyUser, deleteUser, getUsers } = useUsers();
  const [activeMenu, setActiveMenu] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const handleMenuToggle = (userId, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  const handleAction = async (actionFn, userId, e) => {
    e.stopPropagation();
    setActiveMenu(null);
    setActionLoadingId(userId);
    try {
      await actionFn(userId);
      await getUsers();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleImpersonate = async (userId, userEmail, e) => {
    e.stopPropagation();
    setActiveMenu(null);
    if (!confirm(`Are you sure you want to impersonate ${userEmail}?`)) return;
    try {
      const response = await impersonateUser(userId);
      const tokens = response.data?.tokens;
      if (tokens?.access) {
        // Back up admin session
        const currentToken = localStorage.getItem('access_token');
        if (currentToken) {
          sessionStorage.setItem('impersonator_original_token', currentToken);
        }
        localStorage.setItem('access_token', tokens.access);
        if (tokens.refresh) {
          localStorage.setItem('refresh_token', tokens.refresh);
        }
        window.location.reload();
      }
    } catch (err) {
      console.error('Impersonation failed:', err);
      alert('Impersonation failed: ' + (err.response?.data?.error || err.message));
    }
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
        <span>Loading users...</span>
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
          {users.map((user) => {
            const isLocked = Boolean(user.locked_until && new Date(user.locked_until) > new Date());
            const isRowBusy = actionLoadingId === user.id;

            return (
              <tr
                key={user.id}
                className={`user-table-row ${isRowBusy ? 'row-busy' : ''}`}
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
                  <UserStatusBadge user={user} variant="composite" />
                </td>
                <td>
                  {user.mfa_enabled ? (
                    <span className="mfa-enabled" title="MFA Protected">✓ Active</span>
                  ) : (
                    <span className="mfa-disabled" title="No MFA">—</span>
                  )}
                </td>
                <td>{formatDate(user.last_login)}</td>
                <td>{formatDate(user.created_at)}</td>
                <td className="actions-cell">
                  <div className="action-menu">
                    <button
                      className="menu-trigger"
                      onClick={(e) => handleMenuToggle(user.id, e)}
                      title="User Actions"
                    >
                      <FiMoreVertical />
                    </button>
                    {activeMenu === user.id && (
                      <div className="menu-dropdown">
                        <button onClick={(e) => { e.stopPropagation(); onRowClick && onRowClick(user); }}>
                          <FiEdit /> View Details
                        </button>

                        {/* Activation toggle */}
                        {user.is_active !== false ? (
                          <button
                            className="danger"
                            onClick={(e) => handleAction(deactivateUser, user.id, e)}
                          >
                            <FiUserX /> Deactivate
                          </button>
                        ) : (
                          <button
                            className="success"
                            onClick={(e) => handleAction(activateUser, user.id, e)}
                          >
                            <FiUserCheck /> Activate
                          </button>
                        )}

                        {/* Verification toggle */}
                        {!user.is_verified && (
                          <button
                            onClick={(e) => handleAction(verifyUser, user.id, e)}
                          >
                            <FiCheck /> Verify Identity
                          </button>
                        )}

                        {/* Lock/Unlock */}
                        {isLocked && (
                          <button
                            onClick={(e) => handleAction(unlockUser, user.id, e)}
                          >
                            <FiUnlock /> Unlock Account
                          </button>
                        )}

                        {/* Impersonation for Super Admin */}
                        {isSuperAdmin && (
                          <button
                            onClick={(e) => handleImpersonate(user.id, user.email, e)}
                          >
                            <FiShield /> Impersonate
                          </button>
                        )}

                        <hr />
                        <button
                          className="danger"
                          onClick={(e) => {
                            if (confirm(`Delete user ${user.email}?`)) {
                              handleAction(deleteUser, user.id, e);
                            }
                          }}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;