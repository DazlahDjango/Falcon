import React, { useState } from 'react';
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiKey,
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';

export const RoleTable = ({ roles, isLoading, onRowClick }) => {
  const { isSuperAdmin } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuToggle = (roleId, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === roleId ? null : roleId);
  };

  const getRoleTypeBadge = (type) => {
    const badges = {
      system: <span className="role-type-badge system">System</span>,
      custom: <span className="role-type-badge custom">Custom</span>,
    };
    return badges[type] || <span className="role-type-badge default">{type}</span>;
  };

  if (isLoading) {
    return (
      <div className="role-table-loading">
        <div className="spinner-sm" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="role-table-container">
      <table className="role-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Code</th>
            <th>Type</th>
            <th>Permissions</th>
            <th>Assignable</th>
            <th>Users</th>
            <th className="actions-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr
              key={role.id}
              className="role-table-row"
              onClick={() => onRowClick && onRowClick(role)}
            >
              <td>
                <div className="role-cell">
                  <FiShield className="role-icon" />
                  <div className="role-cell-info">
                    <span className="role-cell-name">{role.name}</span>
                    <span className="role-cell-description">{role.description || '-'}</span>
                  </div>
                </div>
              </td>
              <td>
                <code className="role-code">{role.code}</code>
              </td>
              <td>{getRoleTypeBadge(role.role_type)}</td>
              <td>
                <span className="permission-count">
                  <FiKey /> {role.permission_count || 0}
                </span>
              </td>
              <td>
                {role.is_assignable ? (
                  <FiCheckCircle className="status-icon success" />
                ) : (
                  <FiXCircle className="status-icon error" />
                )}
              </td>
              <td>
                <span className="user-count">
                  <FiUsers /> {role.user_count || 0}
                </span>
              </td>
              <td className="actions-cell">
                <div className="action-menu">
                  <button
                    className="menu-trigger"
                    onClick={(e) => handleMenuToggle(role.id, e)}
                  >
                    <FiMoreVertical />
                  </button>
                  {activeMenu === role.id && (
                    <div className="menu-dropdown">
                      <button onClick={(e) => { e.stopPropagation(); onRowClick && onRowClick(role); }}>
                        <FiShield /> View Details
                      </button>
                      {!role.is_system && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); /* handle edit */ }}>
                            <FiEdit /> Edit
                          </button>
                          <button className="danger" onClick={(e) => { e.stopPropagation(); /* handle delete */ }}>
                            <FiTrash2 /> Delete
                          </button>
                        </>
                      )}
                      {role.is_system && (
                        <button disabled className="menu-disabled">
                          System roles cannot be modified
                        </button>
                      )}
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
export default RoleTable;