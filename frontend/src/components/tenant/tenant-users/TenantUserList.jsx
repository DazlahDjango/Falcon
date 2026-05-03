// frontend/src/components/tenant/tenant-users/TenantUserList.jsx
import React from 'react';
import './tenant-users.css';

export const TenantUserList = ({ users, onRemoveUser, onRoleChange, loading = false }) => {
    if (loading) {
        return (
            <div className="tenant-users-table-container">
                <div className="text-center p-8 text-gray-500">Loading users...</div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="tenant-users-table-container">
                <div className="text-center p-8 text-gray-500">No users found</div>
            </div>
        );
    }

    const getRoleClass = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'tenant-role-admin';
            case 'manager':
                return 'tenant-role-manager';
            case 'staff':
                return 'tenant-role-staff';
            case 'readonly':
                return 'tenant-role-readonly';
            default:
                return 'tenant-role-staff';
        }
    };

    return (
        <div className="tenant-users-table-container">
            <div className="overflow-x-auto">
                <table className="tenant-users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="font-medium">{user.name || user.full_name || '-'}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role || 'staff'}
                                        onChange={(e) => onRoleChange?.(user.id, e.target.value)}
                                        className={`tenant-role-badge ${getRoleClass(user.role)} border-0`}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="staff">Staff</option>
                                        <option value="readonly">Read Only</option>
                                    </select>
                                </td>
                                <td>
                                    {user.is_active ? (
                                        <span className="text-green-600">Active</span>
                                    ) : (
                                        <span className="text-red-600">Inactive</span>
                                    )}
                                </td>
                                <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                                <td>
                                    <button
                                        onClick={() => onRemoveUser?.(user.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};