import React, { useState, useEffect } from 'react';
import {
  FiKey,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiSearch,
  FiAlertTriangle,
  FiSave,
} from 'react-icons/fi';
import { useRoles } from '../../../hooks/accounts/useRoles';
import { usePermissions } from '../../../hooks/accounts/usePermissions';

export const RolePermissionManager = ({ roleId, isEditable = true }) => {
  const { getRolePermissions, assignPermissions, rolePermissions, isLoading } = useRoles();
  const { getPermissions, permissions, isLoading: permissionsLoading } = usePermissions();

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (roleId) {
      loadData();
    }
  }, [roleId]);

  const loadData = async () => {
    await Promise.all([
      getRolePermissions(roleId),
      getPermissions(),
    ]);
  };

  useEffect(() => {
    if (rolePermissions) {
      const permIds = rolePermissions.map(p => p.codename || p);
      setSelectedPermissions(permIds);
    }
  }, [rolePermissions]);

  const handleToggle = (permCodename) => {
    if (!isEditable) return;
    setSelectedPermissions(prev =>
      prev.includes(permCodename)
        ? prev.filter(p => p !== permCodename)
        : [...prev, permCodename]
    );
  };

  const handleSelectAll = () => {
    if (!isEditable) return;
    const allPerms = filteredPermissions.map(p => p.codename);
    setSelectedPermissions(allPerms);
  };

  const handleDeselectAll = () => {
    if (!isEditable) return;
    setSelectedPermissions([]);
  };

  const handleSave = async () => {
    if (!isEditable) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await assignPermissions(roleId, selectedPermissions);
      if (result.success !== false) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        await getRolePermissions(roleId);
      } else {
        setError(result.error || 'Failed to save permissions');
      }
    } catch (err) {
      setError(err?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const filteredPermissions = permissions.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || permissionsLoading) {
    return (
      <div className="permission-manager-loading">
        <div className="spinner-sm" />
        <span>Loading permissions...</span>
      </div>
    );
  }

  return (
    <div className="permission-manager">
      <div className="permission-manager-header">
        <div className="permission-manager-title">
          <FiKey className="title-icon" />
          <h3>Permissions ({selectedPermissions.length} selected)</h3>
        </div>
        <div className="permission-manager-actions">
          <button className="btn-icon" onClick={loadData}>
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
          {isEditable && (
            <>
              <button className="btn-secondary-sm" onClick={handleSelectAll}>
                Select All
              </button>
              <button className="btn-secondary-sm" onClick={handleDeselectAll}>
                Deselect All
              </button>
              <button
                className="btn-primary-sm"
                onClick={handleSave}
                disabled={saving}
              >
                <FiSave /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="permission-manager-error">
          <FiAlertTriangle className="error-icon" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="permission-manager-success">
          <FiCheckCircle className="success-icon" />
          <span>Permissions updated successfully!</span>
        </div>
      )}

      <div className="permission-manager-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredPermissions.length === 0 ? (
        <div className="permission-manager-empty">
          <FiKey className="empty-icon" />
          <p>No permissions found</p>
        </div>
      ) : (
        <div className="permission-manager-grid">
          {filteredPermissions.map((perm) => {
            const isSelected = selectedPermissions.includes(perm.codename);
            return (
              <div
                key={perm.id}
                className={`permission-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggle(perm.codename)}
              >
                <div className="permission-check">
                  {isSelected ? (
                    <FiCheckCircle className="check-icon selected" />
                  ) : (
                    <FiXCircle className="check-icon unselected" />
                  )}
                </div>
                <div className="permission-info">
                  <span className="permission-name">{perm.name}</span>
                  <span className="permission-codename">{perm.codename}</span>
                  {perm.category && (
                    <span className="permission-category">{perm.category}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isEditable && (
        <div className="permission-manager-readonly">
          <FiAlertTriangle />
          <span>This role is read-only. Permissions cannot be modified.</span>
        </div>
      )}
    </div>
  );
};
export default RolePermissionManager;