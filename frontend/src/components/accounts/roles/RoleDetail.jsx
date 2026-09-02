import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiShield,
  FiUsers,
  FiKey,
  FiCheckCircle,
  FiXCircle,
  FiUserCheck,
  FiRefreshCw,
} from 'react-icons/fi';
import { useRoles } from '../../../hooks/accounts/useRoles';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { RolePermissionManager } from './RolePermissionManager';
import { RoleForm } from './RoleForm';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const {
    selectedRole: role,
    isLoading,
    error,
    getRole,
    deleteRole,
    clearSelectedRole,
    clearError,
  } = useRoles();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      getRole(id);
    }
    return () => clearSelectedRole();
  }, [id, getRole, clearSelectedRole]);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteRole(role.id);
      navigate(ACCOUNTS_ROUTES.ROLES);
    } catch (err) {
      console.error('Failed to delete role:', err);
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading && !role) {
    return (
      <div className="role-detail-loading">
        <div className="spinner" />
        <p>Loading role details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="role-detail-error">
        <p>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</p>
        <button className="btn-primary" onClick={() => navigate(ACCOUNTS_ROUTES.ROLES)}>
          <FiArrowLeft /> Back to Roles
        </button>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="role-detail-empty">
        <p>Role not found</p>
        <button className="btn-primary" onClick={() => navigate(ACCOUNTS_ROUTES.ROLES)}>
          <FiArrowLeft /> Back to Roles
        </button>
      </div>
    );
  }

  const canEdit = !role.is_system && (isSuperAdmin);

  return (
    <div className="role-detail-container">
      <div className="role-detail-header">
        <button className="back-btn" onClick={() => navigate(ACCOUNTS_ROUTES.ROLES)}>
          <FiArrowLeft /> Back to Roles
        </button>
        {canEdit && (
          <div className="role-detail-actions">
            <button className="btn-primary" onClick={() => setShowEditModal(true)}>
              <FiEdit /> Edit
            </button>
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              <FiTrash2 /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="role-detail-card">
        <div className="role-detail-icon">
          <FiShield className="role-icon-large" />
        </div>
        <div className="role-detail-info">
          <h1 className="role-detail-name">{role.name}</h1>
          <div className="role-detail-meta">
            <code className="role-detail-code">{role.code}</code>
            <span className={`role-type-badge ${role.role_type}`}>
              {role.role_type || 'Custom'}
            </span>
            {role.is_system && (
              <span className="role-system-badge">System Role</span>
            )}
            {role.is_assignable ? (
              <span className="role-assignable-badge">
                <FiCheckCircle /> Assignable
              </span>
            ) : (
              <span className="role-not-assignable-badge">
                <FiXCircle /> Not Assignable
              </span>
            )}
          </div>
          {role.description && (
            <p className="role-detail-description">{role.description}</p>
          )}
        </div>
      </div>

      <div className="role-detail-stats">
        <div className="stat-item">
          <FiUsers className="stat-icon" />
          <div>
            <span className="stat-value">{role.user_count || 0}</span>
            <span className="stat-label">Users</span>
          </div>
        </div>
        <div className="stat-item">
          <FiKey className="stat-icon" />
          <div>
            <span className="stat-value">{role.permission_count || 0}</span>
            <span className="stat-label">Permissions</span>
          </div>
        </div>
        <div className="stat-item">
          <FiUserCheck className="stat-icon" />
          <div>
            <span className="stat-value">{role.child_count || 0}</span>
            <span className="stat-label">Child Roles</span>
          </div>
        </div>
      </div>

      <div className="role-detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <FiShield /> Details
        </button>
        <button
          className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <FiKey /> Permissions
        </button>
      </div>

      <div className="role-detail-content">
        {activeTab === 'details' && (
          <div className="details-tab">
            <div className="info-grid">
              <div className="info-item">
                <label>Role Name</label>
                <span>{role.name}</span>
              </div>
              <div className="info-item">
                <label>Role Code</label>
                <span><code>{role.code}</code></span>
              </div>
              <div className="info-item">
                <label>Type</label>
                <span>{role.role_type || 'Custom'}</span>
              </div>
              <div className="info-item">
                <label>System Role</label>
                <span>{role.is_system ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item">
                <label>Assignable</label>
                <span>{role.is_assignable ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item">
                <label>Parent Role</label>
                <span>{role.parent_name || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Order</label>
                <span>{role.order || 0}</span>
              </div>
              <div className="info-item">
                <label>Created At</label>
                <span>{new Date(role.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <RolePermissionManager roleId={role.id} isEditable={canEdit} />
        )}
      </div>

      {showEditModal && (
        <RoleForm
          role={role}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            getRole(role.id);
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Role</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{role.name}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoleDetail;