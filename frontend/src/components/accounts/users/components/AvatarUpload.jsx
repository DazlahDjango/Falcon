import React, { useRef, useState } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';
import { useProfile } from '../../../../hooks/accounts/useProfile';

const AvatarUpload = () => {
    const fileInputRef = useRef(null);
    const { profile, uploadUserAvatar, removeUserAvatar, isUploadingAvatar, avatarUploadProgress } = useProfile();
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload
        await uploadUserAvatar(file, (progress) => {
            // Progress handled by hook
        });
    };

    const handleRemove = async () => {
        await removeUserAvatar();
        setPreviewUrl(null);
    };

    const avatarUrl = previewUrl || profile?.avatar;

    return (
        <div className="avatar-upload">
            <div className="avatar-preview">
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="avatar-image" />
                ) : (
                    <div className="avatar-placeholder">
                        {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                    </div>
                )}
                {isUploadingAvatar && (
                    <div className="avatar-progress">
                        <div className="progress-bar" style={{ width: `${avatarUploadProgress}%` }} />
                    </div>
                )}
            </div>
            <div className="avatar-actions">
                <button
                    type="button"
                    className="btn-icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                >
                    <FiCamera size={16} />
                    Upload
                </button>
                {avatarUrl && (
                    <button
                        type="button"
                        className="btn-icon danger"
                        onClick={handleRemove}
                        disabled={isUploadingAvatar}
                    >
                        <FiX size={16} />
                        Remove
                    </button>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default AvatarUpload;