import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiLock, FiUnlock } from 'react-icons/fi';
import { fetchAllUsers, deleteUserAdmin, suspendUser, activateUserAdmin } from '../../../store/accounts/slice/adminSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';

const AdminUsers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users, isLoading } = useSelector((state) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState(null);
    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);
    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleDelete = async () => {
        if (selectedUser) {
            await dispatch(deleteUserAdmin(selectedUser.id));
            setSelectedUser(null);
            setActionType(null);
        }
    };
    const handleSuspend = async () => {
        if (selectedUser) {
            await dispatch(suspendUser(selectedUser.id));
            setSelectedUser(null);
            setActionType(null);
        }
    };
    const handleActivate = async () => {
        if (selectedUser) {
            await dispatch(activateUserAdmin(selectedUser.id));
            setSelectedUser(null);
            setActionType(null);
        }
    };
    if (isLoading && !users.length) {
        return <SkeletonLoader type='table' />;
    }
    return (
        <div className="admin-users">
            <div className="page-header">
                <h1>Manage Users</h1>
                <button className="btn btn-primary" onClick={() => navigate('/admin/users/create')}>
                    <FiPlus size={16} />
                    Create User
                </button>
            </div>
            
            <div className="search-bar">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Tenant</th>
                            <th>Status</th>
                            <th>MFA</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">
                                        <img 
                                            src={user.avatar_url || '/static/accounts/img/default-avatar.png'} 
                                            alt={user.username}
                                            className="user-avatar-sm"
                                        />
                                        <span>{user.full_name || user.username}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td><span className="role-badge">{user.role}</span></td>
                                <td>{user.tenant_name || '—'}</td>
                                <td>
                                    <span className={`status-badge ${user.is_active ? 'active' : 'suspended'}`}>
                                        {user.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`mfa-badge ${user.mfa_enabled ? 'enabled' : 'disabled'}`}>
                                        {user.mfa_enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <button className="action-icon" onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                        <FiEdit size={16} />
                                    </button>
                                    {user.is_active ? (
                                        <button className="action-icon suspend" onClick={() => { setSelectedUser(user); setActionType('suspend'); }}>
                                            <FiLock size={16} />
                                        </button>
                                    ) : (
                                        <button className="action-icon activate" onClick={() => { setSelectedUser(user); setActionType('activate'); }}>
                                            <FiUnlock size={16} />
                                        </button>
                                    )}
                                    <button className="action-icon delete" onClick={() => { setSelectedUser(user); setActionType('delete'); }}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <ConfirmationDialog
                isOpen={!!selectedUser && actionType === 'delete'}
                onClose={() => { setSelectedUser(null); setActionType(null); }}
                onConfirm={handleDelete}
                type="danger"
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.email}? This action cannot be undone.`}
                confirmText="Delete"
            />
            
            <ConfirmationDialog
                isOpen={!!selectedUser && actionType === 'suspend'}
                onClose={() => { setSelectedUser(null); setActionType(null); }}
                onConfirm={handleSuspend}
                type="warning"
                title="Suspend User"
                message={`Are you sure you want to suspend ${selectedUser?.email}? They will not be able to log in.`}
                confirmText="Suspend"
            />
            
            <ConfirmationDialog
                isOpen={!!selectedUser && actionType === 'activate'}
                onClose={() => { setSelectedUser(null); setActionType(null); }}
                onConfirm={handleActivate}
                type="success"
                title="Activate User"
                message={`Are you sure you want to activate ${selectedUser?.email}? They will be able to log in again.`}
                confirmText="Activate"
            />
        </div>
    );
};
export default AdminUsers;