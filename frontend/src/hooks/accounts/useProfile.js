import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCurrentUserProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    changePassword,
    clearProfileError,
    resetProfile,
    setAvatarProgress,
    selectProfile,
} from '../../store/accounts/slice/profileSlice';

export const useProfile = () => {
    const dispatch = useDispatch();
    const profileState = useSelector(selectProfile) || {
        profile: null,
        profileData: null,
        isLoading: false,
        error: null,
        avatarUploadProgress: 0,
        isUploadingAvatar: false
    };

    // Local UI state
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    // ========== Data Fetching ==========

    const loadProfile = useCallback(async () => {
        return await dispatch(fetchCurrentUserProfile()).unwrap();
    }, [dispatch]);

    // ========== Profile Management ==========

    const updateUserProfile = useCallback(async (data) => {
        const result = await dispatch(updateProfile(data)).unwrap();
        setIsEditing(false);
        return result;
    }, [dispatch]);

    const uploadUserAvatar = useCallback(async (file, onProgress) => {
        const result = await dispatch(uploadAvatar({ file, onProgress })).unwrap();
        return result;
    }, [dispatch]);

    const removeUserAvatar = useCallback(async () => {
        return await dispatch(deleteAvatar()).unwrap();
    }, [dispatch]);

    // ========== Password Management ==========

    const validatePasswordForm = useCallback(() => {
        const errors = {};

        if (!passwordForm.old_password) {
            errors.old_password = 'Current password is required';
        }
        if (!passwordForm.new_password) {
            errors.new_password = 'New password is required';
        } else if (passwordForm.new_password.length < 8) {
            errors.new_password = 'Password must be at least 8 characters';
        }
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            errors.confirm_password = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    }, [passwordForm]);

    const changeUserPassword = useCallback(async () => {
        if (!validatePasswordForm()) {
            return false;
        }

        const result = await dispatch(changePassword({
            oldPassword: passwordForm.old_password,
            newPassword: passwordForm.new_password,
        })).unwrap();

        // Reset form on success
        setPasswordForm({
            old_password: '',
            new_password: '',
            confirm_password: '',
        });
        setPasswordErrors({});

        return result;
    }, [dispatch, passwordForm, validatePasswordForm]);

    // ========== Form Handlers ==========

    const startEditing = useCallback((profile) => {
        setEditFormData({
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            phone: profile?.phone_number || '',
            department: profile?.department || '',
            title: profile?.title || '',
        });
        setIsEditing(true);
    }, []);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        setEditFormData({});
    }, []);

    const updateEditForm = useCallback((field, value) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const updatePasswordForm = useCallback((field, value) => {
        setPasswordForm(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user types
        if (passwordErrors[field]) {
            setPasswordErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [passwordErrors]);

    // ========== Utilities ==========

    const clearProfileErrors = useCallback(() => {
        dispatch(clearProfileError());
    }, [dispatch]);

    const resetProfileState = useCallback(() => {
        dispatch(resetProfile());
    }, [dispatch]);

    const updateAvatarProgress = useCallback((progress) => {
        dispatch(setAvatarProgress(progress));
    }, [dispatch]);

    // ========== Computed Values ==========

    const getFullName = () => {
        const profile = profileState.profile;
        return `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.email;
    };

    const getInitials = () => {
        const fullName = getFullName();
        if (fullName === profileState.profile?.email) {
            return fullName.charAt(0).toUpperCase();
        }
        return fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    const isProfileComplete = () => {
        const profile = profileState.profile;
        if (!profile) return false;

        const requiredFields = ['first_name', 'last_name', 'phone_number'];
        return requiredFields.every(field => profile[field]);
    };

    const getProfileCompletionPercentage = () => {
        const profile = profileState.profile;
        if (!profile) return 0;

        const fields = [
            'first_name', 'last_name', 'phone_number',
            'department', 'title', 'avatar'
        ];
        const completed = fields.filter(field => profile[field]).length;
        return Math.round((completed / fields.length) * 100);
    };

    // ========== Load on Mount ==========

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // ========== Return ==========

    return {
        // State
        profile: profileState.profile,
        isLoading: profileState.isLoading,
        error: profileState.error,
        avatarUploadProgress: profileState.avatarUploadProgress,
        isUploadingAvatar: profileState.isUploadingAvatar,

        // Form State
        isEditing,
        editFormData,
        passwordForm,
        passwordErrors,

        // Actions - Profile Management
        loadProfile,
        updateUserProfile,
        uploadUserAvatar,
        removeUserAvatar,

        // Actions - Password
        changeUserPassword,
        validatePasswordForm,

        // Actions - Form Handlers
        startEditing,
        cancelEditing,
        updateEditForm,
        updatePasswordForm,

        // Actions - Utilities
        clearProfileErrors,
        resetProfileState,
        updateAvatarProgress,

        // Computed Values
        getFullName,
        getInitials,
        isProfileComplete,
        getProfileCompletionPercentage,
    };
};