import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit, FiTrash2, FiLock } from 'react-icons/fi';
import { fetchRoles, deleteRole } from '../../../store/accounts/slice/roleSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import EmptyState from '../../common/Feedback/EmptyState';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';

const RoleList = () => {
    const navifate = useNavigate();
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
            await dispatch(deleteRole(deleteTarget.id));
            setDeleteTarget(null);
        }
    };
    if (isLoading && !roles.length) {
        return (
            <div className="role-page">
                <SkeletonLoader type='list' count={5} />
            </div>
        );
    }
    return (
        <div className="roles-page">
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
            
            <div className="roles-grid">
                {roles.map((role) => (
                    <div key={role.id} className="role-card">
                        <div className="role-card-header">
                            <div className="role-icon">
                                {role.is_system ? <FiLock size={20} /> : <FiEdit size={20} />}
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
                                    >
                                        <FiEdit size={16} />
                                    </button>
                                    <button 
                                        className="action-btn delete"
                                        onClick={() => setDeleteTarget(role)}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="role-description">{role.description || 'No description'}</p>
                        <div className="role-meta">
                            <span className="role-type">{role.role_type === 'system' ? 'System Role' : 'Custom Role'}</span>
                            <span className="role-permissions">{role.permission_count || 0} permissions</span>
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