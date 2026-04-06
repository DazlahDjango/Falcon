import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiEdit, FiUsers } from 'react-icons/fi';
import { fetchRoleById } from '../../../store/accounts/slice/roleSlice';
import PermissionList from './components/PermissionList';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const RoleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedRole, isLoading } = useSelector((state) => state.roles);
    const { user } = useSelector((state) => state.auth);
    useEffect(() => {
        dispatch(fetchRoleById(id));
    }, [dispatch, id]);
    const canEdit = user?.role === 'super_admin' || (user?.role === 'client_admin' && !selectedRole?.is_system);
    if (isLoading && !selectedRole) {
        return (
            <div className="role-detail-page">
                <SkeletonLoader type='card' />
            </div>
        );
    }
    if (!selectedRole) {
        return (
            <div className="role-detail-page">
                <div className="not-found">
                    <h2>Role not found</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/roles')}>Back to roles</button>
                </div>
            </div>
        );
    }
    return (
        <div className="role-detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => navigate('/roles')}>
                    <FiArrowLeft size={20} />
                    Back to Roles
                </button>
                {canEdit && (
                    <button className="btn btn-secondary" onClick={() => navigate(`/roles/${id}/edit`)}>
                        <FiEdit size={16} />
                        Edit Role
                    </button>
                )}
            </div>
            
            <div className="role-detail-card">
                <div className="role-header">
                    <div className="role-icon-large">
                        {selectedRole.is_system ? <FiLock size={32} /> : <FiUsers size={32} />}
                    </div>
                    <div className="role-header-info">
                        <h1>{selectedRole.name}</h1>
                        <p className="role-code">{selectedRole.code}</p>
                        <p className="role-description">{selectedRole.description || 'No description'}</p>
                        <div className="role-badges">
                            <span className={`role-type-badge ${selectedRole.role_type}`}>
                                {selectedRole.role_type === 'system' ? 'System Role' : 'Custom Role'}
                            </span>
                            {selectedRole.is_assignable && (
                                <span className="assignable-badge">Assignable</span>
                            )}
                        </div>
                    </div>
                </div>
                
                {selectedRole.parent && (
                    <div className="role-parent">
                        <span>Inherits from:</span>
                        <strong>{selectedRole.parent.name}</strong>
                    </div>
                )}
                
                <div className="role-stats">
                    <div className="stat">
                        <div className="stat-value">{selectedRole.user_count || 0}</div>
                        <div className="stat-label">Users with this role</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">{selectedRole.permission_count || 0}</div>
                        <div className="stat-label">Permissions</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">{selectedRole.child_count || 0}</div>
                        <div className="stat-label">Child roles</div>
                    </div>
                </div>
            </div>
            
            <div className="permissions-section">
                <h2>Permissions</h2>
                <PermissionList 
                    permissions={selectedRole.permissions || []}
                    readOnly
                />
            </div>
        </div>
    );
};
export default RoleDetail;