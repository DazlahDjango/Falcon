import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiRefreshCw,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMoreVertical,
  FiTrash2,
  FiKey,
  FiSmartphone,
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { usePagination } from '../../../hooks/accounts/usePagination';
import { UserAvatar } from '../common/UserAvatar';
import { UserRoleBadge } from '../users/UserRoleBadge';
import { UserStatusBadge } from '../users/UserStatusBadge';

export const AdminMFAManager = () => {
  const {
    getTenantPolicy,
    getAllUsersPolicy,
    updateTenantPolicy,
    updateUserOverride,
    clearOverride,
    resetUser,
    clearDevices,
    tenantPolicy,
    usersPolicy,
    isLoading,
    error,
    clearErrors,
  } = useAdminMFA();

  const [searchTerm, setSearchTerm] = useState('');
  const [mfaRequiredRoles, setMfaRequiredRoles] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 20,
    initialTotal: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      getTenantPolicy(),
      getAllUsersPolicy(),
    ]);
  };

  useEffect(() => {
    if (tenantPolicy?.mfa_required_roles) {
      setMfaRequiredRoles(tenantPolicy.mfa_required_roles);
    }
  }, [tenantPolicy]);

  const handleUpdatePolicy = async () => {
    setUpdating(true);
    try {
      await updateTenantPolicy(mfaRequiredRoles);
      await getTenantPolicy();
    } catch (err) {
      console.error('Failed to update MFA policy:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateUserOverride = async (userId, value) => {
    setActionLoading(true);
    try {
      await updateUserOverride(userId, value);
      await getAllUsersPolicy();
    } catch (err) {
      console.error('Failed to update user MFA override:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearOverride = async (userId) => {
    setActionLoading(true);
    try {
      await clearOverride(userId);
      await getAllUsersPolicy();
    } catch (err) {
      console.error('Failed to clear user MFA override:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetMFA = async (userId) => {
    if (!confirm('Are you sure you want to reset MFA for this user?')) return;
    setActionLoading(true);
    try {
      await resetUser(userId);
      await getAllUsersPolicy();
    } catch (err) {
      console.error('Failed to reset user MFA:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearDevices = async (userId) => {
    if (!confirm('Are you sure you want to clear all MFA devices for this user?')) return;
    setActionLoading(true);
    try {
      await clearDevices(userId);
      await getAllUsersPolicy();
    } catch (err) {
      console.error('Failed to clear user devices:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = usersPolicy.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(search) ||
      user.first_name?.toLowerCase().includes(search) ||
      user.last_name?.toLowerCase().includes(search)
    );
  });

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'client_admin', label: 'Client Admin' },
    { value: 'executive', label: 'Executive' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'staff', label: 'Staff' },
    { value: 'read_only', label: 'Read Only' },
  ];

  return (
    <div className="admin-mfa-manager">
      <div className="admin-mfa-header">
        <div className="admin-mfa-title">
          <FiShield className="title-icon" />
          <h1>MFA Management</h1>
        </div>
        <button className="btn-icon" onClick={loadData}>
          <FiRefreshCw className={isLoading ? 'spinning' : ''} />
        </button>
      </div>

      {error && (
        <div className="admin-mfa-error">
          <span>{error}</span>
          <button onClick={clearErrors}>×</button>
        </div>
      )}

      <div className="admin-mfa-policy-section">
        <div className="policy-card">
          <h3>Tenant MFA Policy</h3>
          <p className="policy-description">
            Select which roles are required to use Multi-Factor Authentication.
          </p>
          <div className="policy-roles">
            {roleOptions.map((role) => (
              <label key={role.value} className="policy-checkbox">
                <input
                  type="checkbox"
                  checked={mfaRequiredRoles.includes(role.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setMfaRequiredRoles([...mfaRequiredRoles, role.value]);
                    } else {
                      setMfaRequiredRoles(mfaRequiredRoles.filter(r => r !== role.value));
                    }
                  }}
                  disabled={updating}
                />
                <span className="checkmark"></span>
                {role.label}
              </label>
            ))}
          </div>
          <button
            className="btn-primary"
            onClick={handleUpdatePolicy}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Policy'}
          </button>
        </div>
      </div>

      <div className="admin-mfa-users-section">
        <div className="section-header">
          <h3>Users MFA Status</h3>
          <div className="section-actions">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {isLoading && usersPolicy.length === 0 ? (
          <div className="admin-mfa-loading">
            <div className="spinner-sm" />
            <span>Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-mfa-empty">
            <FiUser className="empty-icon" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="admin-mfa-table-container">
            <table className="admin-mfa-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>MFA Status</th>
                  <th>Override</th>
                  <th>Effective</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="admin-mfa-row">
                    <td>
                      <div className="user-cell">
                        <UserAvatar user={user} size="sm" />
                        <div className="user-cell-info">
                          <span className="user-cell-name">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="user-cell-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><UserRoleBadge role={user.role} /></td>
                    <td>
                      {user.mfa_enabled ? (
                        <span className="status-badge active"><FiCheckCircle /> Enabled</span>
                      ) : (
                        <span className="status-badge inactive"><FiXCircle /> Disabled</span>
                      )}
                    </td>
                    <td>
                      {user.mfa_required_override === true && (
                        <span className="override-badge enabled">✅ Enabled</span>
                      )}
                      {user.mfa_required_override === false && (
                        <span className="override-badge disabled">❌ Disabled</span>
                      )}
                      {user.mfa_required_override === null && (
                        <span className="override-badge none">— None</span>
                      )}
                    </td>
                    <td>
                      {user.mfa_effective_required ? (
                        <span className="status-badge active"><FiCheckCircle /> Required</span>
                      ) : (
                        <span className="status-badge inactive"><FiXCircle /> Not Required</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {user.mfa_required_override !== true && (
                          <button
                            className="action-btn enable"
                            onClick={() => handleUpdateUserOverride(user.id, true)}
                            disabled={actionLoading}
                            title="Enable MFA override"
                          >
                            <FiCheckCircle />
                          </button>
                        )}
                        {user.mfa_required_override !== false && (
                          <button
                            className="action-btn disable"
                            onClick={() => handleUpdateUserOverride(user.id, false)}
                            disabled={actionLoading}
                            title="Disable MFA override"
                          >
                            <FiXCircle />
                          </button>
                        )}
                        {user.mfa_required_override !== null && (
                          <button
                            className="action-btn clear"
                            onClick={() => handleClearOverride(user.id)}
                            disabled={actionLoading}
                            title="Clear override"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          className="action-btn reset"
                          onClick={() => handleResetMFA(user.id)}
                          disabled={actionLoading}
                          title="Reset MFA"
                        >
                          <FiKey />
                        </button>
                        <button
                          className="action-btn devices"
                          onClick={() => handleClearDevices(user.id)}
                          disabled={actionLoading}
                          title="Clear devices"
                        >
                          <FiSmartphone />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminMFAManager;