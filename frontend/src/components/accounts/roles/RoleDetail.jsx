import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiEdit, FiUsers, FiLock, FiShield, FiChevronRight } from 'react-icons/fi';
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
        if (id) {
            dispatch(fetchRoleById(id));
        }
    }, [dispatch, id]);

    const canEdit = user?.role === 'super_admin' || (user?.role === 'client_admin' && !selectedRole?.is_system);

    if (isLoading && !selectedRole) {
        return (
            <div className="role-detail-page">
                <SkeletonLoader type="card" />
            </div>
        );
    }

    if (!selectedRole) {
        return (
            <div className="role-detail-page">
                <div className="not-found">
                    <h2>Role not found</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/roles')}>
                        Back to Roles
                    </button>
                </div>
            </div>
        );
    }

    const getRoleIcon = () => {
        if (selectedRole.is_system) return <FiLock size={32} />;
        return <FiUsers size={32} />;
    };

    const getRoleTypeBadge = () => {
        if (selectedRole.is_system) {
            return <span className="role-type-badge system">System Role</span>;
        }
        return <span className="role-type-badge custom">Custom Role</span>;
    };

    return (
        <div className="role-detail-page">
            {/* Header */}
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
            
            {/* Role Detail Card */}
            <div className="role-detail-card">
                <div className="role-header">
                    <div className="role-icon-large">
                        {getRoleIcon()}
                    </div>
                    <div className="role-header-info">
                        <h1>{selectedRole.name}</h1>
                        <p className="role-code">{selectedRole.code}</p>
                        <p className="role-description">{selectedRole.description || 'No description provided'}</p>
                        <div className="role-badges">
                            {getRoleTypeBadge()}
                            {selectedRole.is_assignable && (
                                <span className="assignable-badge">Assignable by Tenant Admins</span>
                            )}
                            {selectedRole.parent && (
                                <span className="inherits-badge">
                                    Inherits from: {selectedRole.parent.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Stats Row */}
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
                    <div className="stat">
                        <div className="stat-value">{selectedRole.order || 0}</div>
                        <div className="stat-label">Hierarchy Level</div>
                    </div>
                </div>
            </div>
            
            {/* Permissions Section */}
            <div className="permissions-section">
                <div className="section-header">
                    <h2><FiShield /> Permissions</h2>
                    <span className="permission-count">
                        {selectedRole.permissions?.length || 0} permission(s)
                    </span>
                </div>
                <PermissionList 
                    permissions={selectedRole.permissions || []}
                    readOnly={true}
                />
            </div>
        </div>
    );
};

export default RoleDetail;