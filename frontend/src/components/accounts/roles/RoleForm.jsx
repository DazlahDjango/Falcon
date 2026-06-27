import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiShield,
  FiUserCheck,
  FiAlertCircle,
  FiSave,
  FiCheckCircle,
} from 'react-icons/fi';
import { useRoles } from '../../../hooks/accounts/useRoles';
import { usePermissions } from '../../../hooks/accounts/usePermissions';

export const RoleForm = ({ role, onClose, onSuccess }) => {
  const { createRole, updateRole, isLoading } = useRoles();
  const { getPermissions, permissions } = usePermissions();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_assignable: true,
    parent: '',
    permissions: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isEditing = !!role;

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        code: role.code || '',
        description: role.description || '',
        is_assignable: role.is_assignable !== undefined ? role.is_assignable : true,
        parent: role.parent || '',
        permissions: role.permissions || [],
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePermissionToggle = (permCode) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permCode)
        ? prev.permissions.filter((p) => p !== permCode)
        : [...prev.permissions, permCode],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    const { name, code, description, is_assignable, parent, permissions } = formData;

    if (!name || !code) {
      setFormError('Name and code are required');
      return;
    }

    const submitData = {
      name,
      code: code.toLowerCase().replace(/\s+/g, '_'),
      description,
      is_assignable,
      parent: parent || null,
      permissions,
    };

    try {
      let result;
      if (isEditing) {
        result = await updateRole(role.id, submitData);
      } else {
        result = await createRole(submitData);
      }

      if (result.success !== false) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 1500);
      } else {
        setFormError(result.error || 'Failed to save role');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to save role');
    }
  };

  const permissionList = permissions || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content role-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Role' : 'Create New Role'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {success && (
          <div className="modal-alert success">
            <FiCheckCircle className="alert-icon" />
            <span>Role {isEditing ? 'updated' : 'created'} successfully!</span>
          </div>
        )}

        {formError && (
          <div className="modal-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Role Name</label>
              <div className="form-input-wrapper">
                <FiShield className="input-icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-input ${submitted && !formData.name ? 'error' : ''}`}
                  placeholder="e.g., Project Manager"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading || isEditing}
                  required
                />
              </div>
              {submitted && !formData.name && (
                <span className="form-error">Name is required</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="code" className="form-label">Role Code</label>
              <div className="form-input-wrapper">
                <FiShield className="input-icon" />
                <input
                  id="code"
                  name="code"
                  type="text"
                  className={`form-input ${submitted && !formData.code ? 'error' : ''}`}
                  placeholder="e.g., project_manager"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isLoading || isEditing}
                  required
                />
              </div>
              {submitted && !formData.code && (
                <span className="form-error">Code is required</span>
              )}
              <span className="form-hint">Use lowercase with underscores</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              rows="2"
              placeholder="Describe the role's responsibilities..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assignable</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_assignable"
                  checked={formData.is_assignable}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                This role can be assigned to users
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="parent" className="form-label">Parent Role (Optional)</label>
              <select
                id="parent"
                name="parent"
                className="form-select"
                value={formData.parent}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">None</option>
                {/* Parent roles would be populated here */}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Permissions</label>
            <div className="permissions-grid">
              {permissionList.map((perm) => (
                <label key={perm.id} className="permission-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.codename)}
                    onChange={() => handlePermissionToggle(perm.codename)}
                    disabled={isLoading}
                  />
                  <span className="permission-label">
                    <span className="permission-name">{perm.name}</span>
                    <span className="permission-code">{perm.codename}</span>
                  </span>
                </label>
              ))}
              {permissionList.length === 0 && (
                <p className="permissions-empty">No permissions available</p>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading || success}>
              {isLoading ? (
                <>
                  <span className="spinner-sm" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave /> {isEditing ? 'Update Role' : 'Create Role'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RoleForm;