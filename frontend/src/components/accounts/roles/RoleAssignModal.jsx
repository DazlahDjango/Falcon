import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiUserCheck,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
} from 'react-icons/fi';
import { useRoles } from '../../../hooks/accounts/useRoles';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { UserAvatar } from '../common/UserAvatar';

export const RoleAssignModal = ({ roleId, onClose, onSuccess }) => {
  const { assignRole, isLoading } = useRoles();
  const { getUsers, users, isLoading: usersLoading } = useUsers();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getUsers({ page: 1, pageSize: 50 });
  }, []);

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedUserId) {
      setFormError('Please select a user');
      return;
    }

    try {
      const result = await assignRole(selectedUserId, roleId);
      if (result.success !== false) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 1500);
      } else {
        setFormError(result.error || 'Failed to assign role');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to assign role');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FiUserCheck /> Assign Role
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {success && (
          <div className="modal-alert success">
            <FiCheckCircle className="alert-icon" />
            <span>Role assigned successfully!</span>
          </div>
        )}

        {formError && (
          <div className="modal-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Search Users</label>
            <div className="form-input-wrapper">
              <FiSearch className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={usersLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select User</label>
            <div className="user-select-list">
              {usersLoading ? (
                <div className="user-select-loading">
                  <div className="spinner-sm" />
                  <span>Loading users...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="user-select-empty">
                  <FiUser className="empty-icon" />
                  <p>No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`user-select-item ${selectedUserId === user.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="selectedUser"
                      value={user.id}
                      checked={selectedUserId === user.id}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    />
                    <UserAvatar user={user} size="sm" />
                    <div className="user-select-info">
                      <span className="user-select-name">
                        {user.full_name || user.first_name || user.email}
                      </span>
                      <span className="user-select-email">{user.email}</span>
                    </div>
                    <span className="user-select-role">{user.role}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || success || !selectedUserId}
            >
              {isLoading ? (
                <>
                  <span className="spinner-sm" />
                  Assigning...
                </>
              ) : (
                <>
                  <FiUserCheck /> Assign Role
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RoleAssignModal;