import React from 'react';
import {
  FiKey,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';
import { PermissionBadge } from './PermissionBadge';

export const PermissionTable = ({ permissions, isLoading }) => {
  const getLevelIcon = (level) => {
    const icons = {
      global: <FiShield className="level-icon global" />,
      tenant: <FiLock className="level-icon tenant" />,
      department: <FiLock className="level-icon department" />,
      team: <FiLock className="level-icon team" />,
      self: <FiUnlock className="level-icon self" />,
    };
    return icons[level] || <FiKey className="level-icon default" />;
  };

  const getLevelLabel = (level) => {
    const labels = {
      global: 'Global',
      tenant: 'Tenant',
      department: 'Department',
      team: 'Team',
      self: 'Self',
    };
    return labels[level] || level;
  };

  if (isLoading) {
    return (
      <div className="permission-table-loading">
        <div className="spinner-sm" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="permission-table-container">
      <table className="permission-table">
        <thead>
          <tr>
            <th>Permission</th>
            <th>Codename</th>
            <th>Category</th>
            <th>Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm.id} className="permission-table-row">
              <td>
                <div className="permission-cell">
                  <FiKey className="permission-icon" />
                  <div className="permission-cell-info">
                    <span className="permission-cell-name">{perm.name}</span>
                    {perm.description && (
                      <span className="permission-cell-description">{perm.description}</span>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <code className="permission-codename">{perm.codename}</code>
              </td>
              <td>
                <PermissionBadge
                  type="category"
                  value={perm.category}
                  label={perm.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
              </td>
              <td>
                <span className="permission-level">
                  {getLevelIcon(perm.level)}
                  {getLevelLabel(perm.level)}
                </span>
              </td>
              <td>
                {perm.is_active !== false ? (
                  <span className="status-badge active">
                    <FiCheckCircle /> Active
                  </span>
                ) : (
                  <span className="status-badge inactive">
                    <FiXCircle /> Inactive
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionTable;
