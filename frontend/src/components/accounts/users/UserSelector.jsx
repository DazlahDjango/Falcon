import React, { useEffect } from 'react';
import { useUsers } from '../../../hooks/accounts/useUsers';

const UserSelector = ({ value, onChange, placeholder = 'Select user...', disabled = false, className = '' }) => {
  const { users, isLoading, loadUsers, getFullName } = useUsers();

  useEffect(() => {
    if (users.length === 0 && !isLoading) {
      loadUsers({ page_size: 1000 });
    }
  }, [users.length, isLoading, loadUsers]);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled || isLoading}
      className={`user-selector ${className}`}
    >
      <option value="">{isLoading ? 'Loading users...' : placeholder}</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {getFullName(user)} ({user.email})
        </option>
      ))}
    </select>
  );
};

export default UserSelector;