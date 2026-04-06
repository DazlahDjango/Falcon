import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCamera, FiX } from 'react-icons/fi';
import { uploadAvatar, removeAvatar } from '../../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import Spinner from '../../../common/UI/Spinner';

const AvatarUpload = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            dispatch(showAlert({ type: 'error', message: 'Please select an image file' }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            dispatch(showAlert({ type: 'error', message: 'Image must be less than 5MB' }));
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            await dispatch(uploadAvatar(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Avatar updated successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to upload avatar' }));
        } finally {
            setIsUploading(false);
        }
    };
    const handleRemove = async () => {
        if (window.confirm("Are you sure you want to remove your avatar?")) {
            setIsUploading(true);
            try {
                await dispatch(removeAvatar()).unwrap();
                dispatch(showAlert({ type: 'success', message: 'Avatar removed' }));
            } catch (error) {
                dispatch(showAlert({ type: 'error', message: 'Failed to remove avatar' }));
            } finally {
                setIsUploading(false);
            }
        }
    };
    return (
        <div className="avatar-upload">
            <div className="avatar-preview">
                <img 
                    src={user?.avatar_url || '/static/accounts/img/default-avatar.png'} 
                    alt="Profile"
                />
                {isUploading && (
                    <div className="avatar-loading">
                        <Spinner size="md" />
                    </div>
                )}
            </div>
            
            <div className="avatar-actions">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <button 
                    type="button" 
                    className="avatar-btn upload"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                >
                    <FiCamera size={16} />
                    Upload
                </button>
                {user?.avatar_url && (
                    <button 
                        type="button" 
                        className="avatar-btn remove"
                        onClick={handleRemove}
                        disabled={isUploading}
                    >
                        <FiX size={16} />
                        Remove
                    </button>
                )}
            </div>
            <p className="avatar-hint">Recommended: Square image, max 5MB</p>
        </div>
    );
};
export default AvatarUpload;