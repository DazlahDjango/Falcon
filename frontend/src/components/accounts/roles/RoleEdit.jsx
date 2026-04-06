import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft } from 'react-icons/fi';
import RoleForm from './components/RoleForm';
import { fetchRoleById, updateRole } from '../../../store/accounts/slice/roleSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const RoleEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedRole, isLoading } = useSelector((state) => state.roles);
    useEffect(() => {
        dispatch(fetchRoleById(id));
    }, [dispatch, id]);
    const handleSubmit = async (formData) => {
        try {
            await dispatch(updateRole({ id, ...formData })).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Role updated successfully' }));
            navigate('/roles');
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Railed to update role' }));
        }
    };
    if (isLoading && !selectedRole) {
        return (
            <div className="role-form-page">
                <SkeletonLoader type='form' />
            </div>
        );
    }
    return (
        <div className="role-form-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(`/roles/${id}`)}>
                    <FiArrowLeft size={20} />
                    Back to Role
                </button>
                <h1>Edit Role: {selectedRole?.name}</h1>
            </div>
            
            <RoleForm 
                initialData={selectedRole}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/roles/${id}`)}
                isEdit
            />
        </div>
    );
};
export default RoleEdit;