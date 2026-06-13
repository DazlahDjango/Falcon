import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit, FiTrash2, FiLock, FiUsers, FiShield } from 'react-icons/fi';
import { fetchRoles, deleteRole } from '../../../store/accounts/slice/roleSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import EmptyState from '../../common/Feedback/EmptyState';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';

const RoleList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { roles, isLoading } = useSelector((state) => state.roles);
    const { user } = useSelector((state) => state.auth);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        dispatch(fetchRoles());
    }, [dispatch]);

    const canManageRoles = user?.role === 'super_admin' || user?.role === 'client_admin';

    const handleDelete = async () => {
        if (deleteTarget) {
            try {
                await dispatch(deleteRole(deleteTarget.id)).unwrap();
                dispatch(showAlert({ type: 'success', message: `Role "${deleteTarget.name}" deleted successfully` }));
                setDeleteTarget(null);
            } catch (error) {
                dispatch(showAlert({ type: 'error', message: error || 'Failed to delete role' }));
            }
        }
    };

    const getRoleIcon = (role) => {
        if (role.is_system) return <FiLock size={20} />;
        return <FiUsers size={20} />;
    };

    const getRoleTypeLabel = (role) => {
        if (role.is_system) return 'System Role';
        if (role.role_type === 'custom') return 'Custom Role';
        return role.role_type || 'Custom';
    };

    if (isLoading && !roles.length) {
        return (
            <div className="roles-page">
                <div className="page-header">
                    <h1>Roles</h1>
                    <p>Loading roles...</p>
                </div>
                <SkeletonLoader type="list" count={5} />
            </div>
        );
    }

    return (
        <div className="roles-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Roles</h1>
                    <p>Manage user roles and permissions</p>
                </div>
                {canManageRoles && (
                    <button className="btn btn-primary" onClick={() => navigate('/roles/create')}>
                        <FiPlus size={16} />
                        Create Role
                    </button>
                )}
            </div>
            
            {/* Stats Summary */}
            <div className="roles-stats">
                <div className="stat-card">
                    <div className="stat-value">{roles.length}</div>
                    <div className="stat-label">Total Roles</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{roles.filter(r => r.is_system).length}</div>
                    <div className="stat-label">System Roles</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{roles.filter(r => !r.is_system && r.is_assignable).length}</div>
                    <div className="stat-label">Assignable Roles</div>
                </div>
            </div>
            
            {/* Roles Grid */}
            <div className="roles-grid">
                {roles.map((role) => (
                    <div key={role.id} className="role-card">
                        <div className="role-card-header">
                            <div className="role-icon">
                                {getRoleIcon(role)}
                            </div>
                            <div className="role-info">
                                <h3>{role.name}</h3>
                                <span className="role-code">{role.code}</span>
                            </div>
                            {canManageRoles && !role.is_system && (
                                <div className="role-actions">
                                    <button 
                                        className="action-btn edit"
                                        onClick={() => navigate(`/roles/${role.id}/edit`)}
                                        title="Edit Role"
                                    >
                                        <FiEdit size={16} />
                                    </button>
                                    <button 
                                        className="action-btn delete"
                                        onClick={() => setDeleteTarget(role)}
                                        title="Delete Role"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="role-description">{role.description || 'No description provided'}</p>
                        <div className="role-meta">
                            <span className="role-type">{getRoleTypeLabel(role)}</span>
                            <span className="role-permissions">
                                <FiShield size={12} />
                                {role.permission_count || 0} permissions
                            </span>
                        </div>
                        <button 
                            className="view-details-btn"
                            onClick={() => navigate(`/roles/${role.id}`)}
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>
            
            {roles.length === 0 && (
                <EmptyState 
                    title="No roles found"
                    description="Create roles to manage user permissions"
                    action={canManageRoles}
                    actionText="Create Role"
                    onAction={() => navigate('/roles/create')}
                />
            )}
            
            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                type="danger"
                title="Delete Role"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default RoleList;