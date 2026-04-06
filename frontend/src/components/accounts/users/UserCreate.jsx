import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiArrowLeft } from 'react-icons/fi';
import UserForm from './components/UserForm';
import { createUser } from '../../../store/accounts/slice/userSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const UserCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleSubmit = async (formData) => {
        try {
            await dispatch(createUser(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'User created successfully' }));
            navigate('/users');
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to create user' }));
        }
    };
    return (
        <div className="user-form-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/users')}>
                    <FiArrowLeft size={20} />
                    Back to Users
                </button>
                <h1>Create New User</h1>
            </div>
            
            <UserForm 
                onSubmit={handleSubmit}
                onCancel={() => navigate('/users')}
            />
        </div>
    );
};
export default UserCreate;