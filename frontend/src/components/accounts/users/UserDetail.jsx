import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiMail,
  FiShield,
  FiCalendar,
  FiClock,
  FiUserCheck,
  FiUserX,
  FiUnlock,
  FiUsers,
  FiBriefcase,
  FiPhone,
  FiKey,
  FiMoreVertical,
} from 'react-icons/fi';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { UserAvatar } from '../common/UserAvatar';
import { UserStatusBadge } from './UserStatusBadge';
import { UserRoleBadge } from './UserRoleBadge';
import { UserForm } from './UserForm';
import { UserTeamView } from './UserTeamView';
import { UserReportingChain } from './UserReportingChain';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = useAuth();
  const {
    selectedUser: user,
    isLoading,
    error,
    getUser,
    activateUser,
    deactivateUser,
    unlockUser,
    clearSelectedUser,
    clearError,
  } = useUsers();

  const [activeTab, setActiveTab] = useState('details');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getUser(id);
    }
    return () => clearSelectedUser();
  }, [id, getUser, clearSelectedUser]);

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await activateUser(user.id);
      await getUser(user.id);
    } catch (err) {
      console.error('Failed to activate user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setActionLoading(true);
    try {
      await deactivateUser(user.id);
      await getUser(user.id);
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlock = async () => {
    setActionLoading(true);
    try {
      await unlockUser(user.id);
      await getUser(user.id);
    } catch (err) {
      console.error('Failed to unlock user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(user.id);
      navigate(ACCOUNTS_ROUTES.USERS);
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="user-detail-loading">
        <div className="spinner" />
        <p>Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-detail-error">
        <p>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</p>
        <button className="btn-primary" onClick={() => navigate(ACCOUNTS_ROUTES.USERS)}>
          <FiArrowLeft /> Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-detail-empty">
        <p>User not found</p>
        <button className="btn-primary" onClick={() => navigate(ACCOUNTS_ROUTES.USERS)}>
          <FiArrowLeft /> Back to Users
        </button>
      </div>
    );
  }

  const canManage = isAdmin() || isSuperAdmin;
  const isLocked = user.locked_until !== null && user.locked_until !== undefined;
  const isActive = user.is_active !== false;

  return (
    <div className="user-detail-container">
      <div className="user-detail-header">
        <button className="back-btn" onClick={() => navigate(ACCOUNTS_ROUTES.USERS)}>
          <FiArrowLeft /> Back to Users
        </button>
        {canManage && (
          <div className="user-detail-actions">
            {isLocked && (
              <button className="btn-secondary" onClick={handleUnlock} disabled={actionLoading}>
                <FiUnlock /> Unlock
              </button>
            )}
            {isActive ? (
              <button className="btn-danger" onClick={handleDeactivate} disabled={actionLoading}>
                <FiUserX /> Deactivate
              </button>
            ) : (
              <button className="btn-success" onClick={handleActivate} disabled={actionLoading}>
                <FiUserCheck /> Activate
              </button>
            )}
            <button className="btn-primary" onClick={() => setShowEditModal(true)}>
              <FiEdit /> Edit
            </button>
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              <FiTrash2 /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="user-detail-profile">
        <div className="profile-avatar">
          <UserAvatar user={user} size="2xl" />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.full_name || user.first_name || user.email}</h1>
          <div className="profile-meta">
            <span className="profile-email">
              <FiMail /> {user.email}
            </span>
            <UserRoleBadge role={user.role} />
            <UserStatusBadge isActive={isActive} isVerified={user.is_verified === true} />
            {isLocked && <span className="status-badge locked">Locked</span>}
          </div>
          <div className="profile-details">
            <span><FiBriefcase /> {user.department || 'No Department'}</span>
            <span><FiBriefcase /> {user.title || 'No Title'}</span>
            {user.phone_number && <span><FiPhone /> {user.phone_number}</span>}
            {user.employee_id && <span><FiKey /> {user.employee_id}</span>}
            <span><FiClock /> Joined: {new Date(user.created_at).toLocaleDateString()}</span>
            <span><FiCalendar /> Last Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>
      </div>

      <div className="user-detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <FiUsers /> Team
        </button>
        <button
          className={`tab-btn ${activeTab === 'reporting' ? 'active' : ''}`}
          onClick={() => setActiveTab('reporting')}
        >
          Reporting Chain
        </button>
      </div>

      <div className="user-detail-content">
        {activeTab === 'details' && (
          <div className="tab-content">
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <span>{user.username}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Role</label>
                <span><UserRoleBadge role={user.role} /></span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span><UserStatusBadge isActive={isActive} isVerified={user.is_verified === true} /></span>
              </div>
              <div className="info-item">
                <label>MFA</label>
                <span>{user.mfa_enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="info-item">
                <label>Department</label>
                <span>{user.department || '-'}</span>
              </div>
              <div className="info-item">
                <label>Job Title</label>
                <span>{user.title || '-'}</span>
              </div>
              <div className="info-item">
                <label>Employee ID</label>
                <span>{user.employee_id || '-'}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{user.phone_number || '-'}</span>
              </div>
              <div className="info-item">
                <label>Joined</label>
                <span>{new Date(user.created_at).toLocaleString()}</span>
              </div>
              {user.last_login && (
                <div className="info-item">
                  <label>Last Login</label>
                  <span>{new Date(user.last_login).toLocaleString()}</span>
                </div>
              )}
              {user.locked_until && (
                <div className="info-item">
                  <label>Locked Until</label>
                  <span>{new Date(user.locked_until).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="tab-content">
            <UserTeamView userId={user.id} />
          </div>
        )}

        {activeTab === 'reporting' && (
          <div className="tab-content">
            <UserReportingChain userId={user.id} />
          </div>
        )}
      </div>

      {showEditModal && (
        <UserForm
          user={user}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            getUser(user.id);
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete User</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{user.full_name || user.email}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserDetail;