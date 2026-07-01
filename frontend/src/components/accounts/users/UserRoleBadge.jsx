import React from 'react';
import { USER_ROLE_COLORS } from '../../../config/constants/accountsApiConstants';

export const UserRoleBadge = ({ role, size = 'sm' }) => {
  const getRoleLabel = (roleCode) => {
    const labels = {
      super_admin: 'Super Admin',
      client_admin: 'Client Admin',
      executive: 'Executive',
      supervisor: 'Supervisor',
      staff: 'Staff',
      read_only: 'Read Only',
    };
    return labels[roleCode] || roleCode || 'Unknown';
  };

  const getRoleColor = (roleCode) => {
    const colors = {
      super_admin: 'purple',
      client_admin: 'blue',
      executive: 'green',
      supervisor: 'orange',
      staff: 'gray',
      read_only: 'slate',
    };
    return colors[roleCode] || 'gray';
  };

  const label = getRoleLabel(role);
  const color = getRoleColor(role);

  return (
    <span className={`user-role-badge ${color} ${size}`}>
      {label}
    </span>
  );
};
export default UserRoleBadge;