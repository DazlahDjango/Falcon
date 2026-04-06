import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSave, FiX } from 'react-icons/fi';
import AvatarUpload from '../users/components/AvatarUpload';
import { updateProfile } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const ProfileSettings = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        title: '',
        bio: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                title: user.title || '',
                bio: user.bio || '',
            });
        }
    }, [user]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await dispatch(updateProfile(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Profile updated successfully' }));
            setIsEditing(false);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to update profile' }));
        } finally {
            setIsLoading(false)
        }
    };
    return (
        <div className="profile-settings">
            <div className="settings-header">
                <h2>Profile Information</h2>
                <button 
                    className="edit-toggle"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? <FiX size={16} /> : <FiSave size={16} />}
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>
            
            <div className="profile-avatar-section">
                <AvatarUpload />
            </div>
            
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="form-input"
                        />
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
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled={true}
                        className="form-input"
                    />
                    <small>Email cannot be changed</small>
                </div>
                
                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input"
                        placeholder="+1234567890"
                    />
                </div>
                
                <div className="form-group">
                    <label>Job Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input"
                        placeholder="e.g., Senior Developer"
                    />
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
                        placeholder="Tell us about yourself..."
                    />
                </div>
                
                {isEditing && (
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};
export default ProfileSettings;