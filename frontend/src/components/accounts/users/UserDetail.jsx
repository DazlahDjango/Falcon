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
  FiCheck,
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
import { impersonateUser } from '../../../services/accounts/api/admin';

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
    verifyUser,
    deleteUser,
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

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await verifyUser(user.id);
      await getUser(user.id);
    } catch (err) {
      console.error('Failed to verify user:', err);
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

  const handleImpersonate = async () => {
    if (!confirm(`Are you sure you want to impersonate ${user.email}?`)) return;
    setActionLoading(true);
    try {
      const response = await impersonateUser(user.id);
      const tokens = response.data?.tokens;
      if (tokens?.access) {
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

  const canManage = (isAdmin && isAdmin()) || isSuperAdmin;
  const isLocked = Boolean(user.locked_until && new Date(user.locked_until) > new Date());
  const isActive = user.is_active !== false;

  return (
    <div className="user-detail-container">
      <div className="user-detail-header">
        <button className="back-btn" onClick={() => navigate(ACCOUNTS_ROUTES.USERS)}>
          <FiArrowLeft /> Back to Users
        </button>
        {canManage && (
          <div className="user-detail-actions">
            {/* Unlock if locked */}
            {isLocked && (
              <button className="btn-secondary" onClick={handleUnlock} disabled={actionLoading}>
                <FiUnlock /> Unlock
              </button>
            )}

            {/* Verification action */}
            {!user.is_verified && (
              <button className="btn-secondary" onClick={handleVerify} disabled={actionLoading}>
                <FiCheck /> Verify Identity
              </button>
            )}

            {/* Activation toggle */}
            {isActive ? (
              <button className="btn-danger" onClick={handleDeactivate} disabled={actionLoading}>
                <FiUserX /> Deactivate
              </button>
            ) : (
              <button className="btn-success" onClick={handleActivate} disabled={actionLoading}>
                <FiUserCheck /> Activate
              </button>
            )}

            {/* Impersonate for Super Admin */}
            {isSuperAdmin && (
              <button className="btn-secondary" onClick={handleImpersonate} disabled={actionLoading}>
                <FiShield /> Impersonate
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
            <UserStatusBadge user={user} variant="composite" />
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
                <label>First Name</label>
                <span>{user.first_name || '-'}</span>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <span>{user.last_name || '-'}</span>
              </div>
              <div className="info-item">
                <label>Role</label>
                <UserRoleBadge role={user.role} />
              </div>
              <div className="info-item">
                <label>Status</label>
                <UserStatusBadge user={user} variant="composite" />
              </div>
              <div className="info-item">
                <label>MFA Status</label>
                <span>{user.mfa_enabled ? '✓ Enabled' : '— Disabled'}</span>
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
                <label>Phone Number</label>
                <span>{user.phone_number || '-'}</span>
              </div>
              <div className="info-item">
                <label>Employee ID</label>
                <span>{user.employee_id || '-'}</span>
              </div>
              <div className="info-item">
                <label>Joined Date</label>
                <span>{new Date(user.created_at).toLocaleString()}</span>
              </div>
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
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                &times;
              </button>
            </div>
            <UserForm
              user={user}
              onSuccess={() => {
                setShowEditModal(false);
                getUser(user.id);
              }}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete User</h2>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete user <strong>{user.email}</strong>?</p>
              <p className="warning-text">This action will soft-delete the user account.</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={actionLoading}
              >
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