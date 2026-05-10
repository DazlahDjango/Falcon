import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../../store/accounts/slice/userSlice';

const UserSelector = ({ value, onChange, placeholder = 'Select user...', disabled = false, className = '' }) => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.users);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers({ page_size: 1000 }));
    }
  }, [dispatch, users.length]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className} ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
    >
      <option value="">{isLoading ? 'Loading users...' : placeholder}</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.first_name || user.last_name ? `${user.first_name} ${user.last_name} (${user.email})` : user.email}
        </option>
      ))}
    </select>
  );
};

export default UserSelector;
