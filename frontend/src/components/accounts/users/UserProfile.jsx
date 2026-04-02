import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit, FiSave, FiX, FiUser, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi';
import { updateProfile } from '../../store/slices/authSlice';
import { showAlert } from '../../store/slices/uiSlice';
import AvatarUpload from './components/AvatarUpload';

const UserProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        title: '',
        bio: ''
    });
    
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                title: user.title || '',
                bio: user.bio || ''
            });
        }
    }, [user]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateProfile(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Profile updated successfully' }));
            setIsEditing(false);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to update profile' }));
        }
    };
    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <h1>My Profile</h1>
                {!isEditing ? (
                    <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                        <FiEdit size={16} />
                        Edit Profile
                    </button>
                ) : (
                    <div className="edit-actions">
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            <FiSave size={16} />
                            Save
                        </button>
                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                            <FiX size={16} />
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            <div className="profile-content">
                <div className="profile-avatar-section">
                    <AvatarUpload />
                </div>
                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <div className="input-wrapper">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-wrapper">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={true}
                                className="form-input"
                            />
                        </div>
                        <small>Email cannot be changed</small>
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <div className="input-wrapper">
                            <FiPhone className="input-icon" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Job Title</label>
                        <div className="input-wrapper">
                            <FiBriefcase className="input-icon" />
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={4}
                            className="form-input"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};
export default UserProfile;