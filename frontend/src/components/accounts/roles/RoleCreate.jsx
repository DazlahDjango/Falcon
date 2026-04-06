import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiArrowLeft } from 'react-icons/fi';
import RoleForm from './components/RoleForm';
import { createRole } from '../../../store/accounts/slice/roleSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const RoleCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleSubmit = async (formData) => {
        try {
            await dispatch(createRole(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Role created successfully' }));
            navigate('/roles');
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to create role' }));
        }
    };
    return (
        <div className="role-form-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/roles')}>
                    <FiArrowLeft size={20} />
                    Back to Roles
                </button>
                <h1>Create New Role</h1>
            </div>
            
            <RoleForm 
                onSubmit={handleSubmit}
                onCancel={() => navigate('/roles')}
            />
        </div>
    );
};
export default RoleCreate;