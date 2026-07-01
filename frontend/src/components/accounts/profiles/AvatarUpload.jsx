import React, { useState, useRef } from 'react';
import {
  FiX,
  FiUpload,
  FiUser,
  FiAlertCircle,
  FiCheckCircle,
  FiTrash2,
} from 'react-icons/fi';
import { useProfile } from '../../../hooks/accounts/useProfile';

export const AvatarUpload = ({ profileId, currentAvatar, onClose, onSuccess }) => {
  const { uploadAvatar, deleteAvatar, isLoading } = useProfile();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFormError('Please select a valid image (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    if (file.size > MAX_SIZE) {
      setFormError('Image must be less than 2MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFormError('Please select a file first');
      return;
    }

    setFormError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    const result = await uploadAvatar({
      id: profileId,
      file: selectedFile,
      onProgress: (progress) => setUploadProgress(progress),
    });

    if (result.success !== false) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1000);
    } else {
      setFormError(result.error || 'Failed to upload avatar');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setFormError(null);

    const result = await deleteAvatar(profileId);

    if (result.success !== false) {
      setPreview(null);
      setSelectedFile(null);
      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1000);
    } else {
      setFormError(result.error || 'Failed to delete avatar');
    }
    setIsDeleting(false);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(currentAvatar || null);
    setFormError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content avatar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Avatar</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {success && (
          <div className="modal-alert success">
            <FiCheckCircle className="alert-icon" />
            <span>Avatar updated successfully!</span>
          </div>
        )}

        {formError && (
          <div className="modal-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <div className="avatar-upload-container">
          <div className="avatar-preview">
            {preview ? (
              <img src={preview} alt="Avatar preview" className="avatar-preview-img" />
            ) : (
              <div className="avatar-placeholder">
                <FiUser className="placeholder-icon" />
                <span>No avatar</span>
              </div>
            )}
          </div>

          <div className="avatar-upload-actions">
            <div className="avatar-file-input">
              <label className="file-input-label">
                <FiUpload /> Choose Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isLoading || isDeleting}
                  className="file-input-hidden"
                />
              </label>
              {selectedFile && (
                <span className="file-name">{selectedFile.name}</span>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}

            <div className="avatar-actions">
              {selectedFile && (
                <>
                  <button
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={isLoading || isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleUpload}
                    disabled={isLoading || isDeleting}
                  >
                    {isLoading ? 'Uploading...' : 'Upload'}
                  </button>
                </>
              )}
              {currentAvatar && !selectedFile && (
                <button
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={isLoading || isDeleting}
                >
                  <FiTrash2 /> {isDeleting ? 'Deleting...' : 'Remove Avatar'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="avatar-upload-info">
          <p>Supported formats: JPEG, PNG, GIF, WEBP</p>
          <p>Maximum size: 2MB</p>
        </div>
      </div>
    </div>
  );
};
export default AvatarUpload;