import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft } from 'react-icons/fi';
import UserForm from './components/UserForm';
import { fetchUserById, updateUser } from '../../store/slices/userSlice';
import { showAlert } from '../../store/slices/uiSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { seletedUser, isLoading } = useSelector((state) => state.users);
    useEffect(() => {
        dispatch(fetchUserById(id));
    }, [dispatch,id]);
    const handleSubmit = async (formData) => {
        try {
            await dispatch(updateUser({ id, ...formData })).unwrap();
            dispatch(showAlert({ type: 'success', message: 'User updated successfully' }));
            navigate(`/users/${id}`);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to update user' }));
        }
    };
    if (isLoading && !seletedUser) {
        return (
            <div className="user-form-page">
                <SkeletonLoader type='form' />
            </div>
        );
    }
    return (
        <div className="user-form-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(`/users/${id}`)}>
                    <FiArrowLeft size={20} />
                    Back to Profile
                </button>
                <h1>Edit User</h1>
            </div>
            
            <UserForm 
                initialData={selectedUser}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/users/${id}`)}
                isEdit
            />
        </div>
    );
};
export default UserEdit;