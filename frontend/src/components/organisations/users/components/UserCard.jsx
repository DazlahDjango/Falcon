import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user, onEdit, onDelete, onResendInvite }) => {
  const getStatusBadge = () => {
    if (!user.is_active) {
      return <span className="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-red-100 text-red-800">Inactive</span>;
    }
    if (user.is_invited && !user.is_verified) {
      return <span className="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-yellow-100 text-yellow-800">Pending Invite</span>;
    }
    return <span className="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-green-100 text-green-800">Active</span>;
  };

  const getRoleBadge = () => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      staff: 'bg-gray-100 text-gray-800',
      viewer: 'bg-green-100 text-green-800',
    };
    const color = roleColors[user.role] || 'bg-gray-100 text-gray-800';
    return <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${color}`}>{user.role || 'Staff'}</span>;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-lg">
                {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-md font-medium text-gray-900">{user.name || 'No name'}</h3>
              {getRoleBadge()}
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.department_name && (
              <p className="text-xs text-gray-400 mt-1">Department: {user.department_name}</p>
            )}
            {user.position && (
              <p className="text-xs text-gray-400">Position: {user.position}</p>
            )}
            {user.last_login && (
              <p className="text-xs text-gray-400 mt-1">
                Last login: {new Date(user.last_login).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <Link to={`/users/${user.id}`} className="p-1 text-blue-600 hover:text-blue-800" title="View">
            👁️
          </Link>
          <button onClick={() => onEdit(user)} className="p-1 text-indigo-600 hover:text-indigo-800" title="Edit">
            ✏️
          </button>
          {user.is_invited && !user.is_verified && (
            <button onClick={() => onResendInvite(user)} className="p-1 text-green-600 hover:text-green-800" title="Resend Invite">
              📧
            </button>
          )}
          <button onClick={() => onDelete(user)} className="p-1 text-red-600 hover:text-red-800" title="Delete">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;