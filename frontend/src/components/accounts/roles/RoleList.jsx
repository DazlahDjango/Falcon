import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit, FiTrash2, FiLock } from 'react-icons/fi';
import { fetchRoles, deleteRole } from '../../store/slices/roleSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import { EmptyState } from '../../common/Feedback/EmptyState';
import { ConfirmationDialog } from '../../common/Feedback/ConfirmationDialog';

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
        )
    }
}