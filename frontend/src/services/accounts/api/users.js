import { request } from './client';

// ============================================================
// USER CRUD
// ============================================================
export const getUsers = (params = {}) => {
    return request.get('/users/', { params });
};

export const getUserById = (userId) => {
    return request.get(`/users/${userId}/`);
};

export const getCurrentUser = () => {
    return request.get('/users/me/');
};

export const createUser = (data) => {
    return request.post('/users/', data);
};

export const updateUser = (userId, data) => {
    return request.patch(`/users/${userId}/`, data);
};

export const deleteUser = (userId) => {
    return request.delete(`/users/${userId}/`);
};

export const updateProfile = (data) => {
    return request.patch('/users/me/', data);
};

// ============================================================
// AVATAR MANAGEMENT (FIXED - uses profiles endpoint)
// ============================================================
// First get user's profile ID
export const getMyProfile = () => {
    return request.get('/profiles/my/');
};

export const getProfileByUserId = (userId) => {
    return request.get(`/users/${userId}/profile/`);
};

export const uploadAvatar = async (formData, onProgress) => {
    // Get current user's profile first
    try {
        const profile = await getMyProfile();
        const profileId = profile.data?.id || profile.id;
        return request.post(`/profiles/${profileId}/avatar/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total))
        });
    } catch (error) {
        console.error('Failed to get profile for avatar upload:', error);
        throw error;
    }
};

export const deleteAvatar = async () => {
    try {
        const profile = await getMyProfile();
        const profileId = profile.data?.id || profile.id;
        return request.delete(`/profiles/${profileId}/avatar/`);
    } catch (error) {
        console.error('Failed to get profile for avatar deletion:', error);
        throw error;
    }
};

export const removeAvatar = async (userId) => {
    if (userId === 'me' || !userId) {
        return deleteAvatar();
    }
    try {
        const profile = await getProfileByUserId(userId);
        const profileId = profile.data?.id || profile.id;
        return request.delete(`/profiles/${profileId}/avatar/`);
    } catch (error) {
        console.error('Failed to get profile for avatar removal:', error);
        throw error;
    }
};

// ============================================================
// USER ACTIONS
// ============================================================
export const activateUser = (userId) => {
    return request.post(`/users/${userId}/activate/`);
};

export const deactivateUser = (userId) => {
    return request.post(`/users/${userId}/deactivate/`);
};

export const unlockUser = (userId) => {
    return request.post(`/users/${userId}/unlock/`);
};

export const assignRole = (userId, role) => {
    return request.post(`/users/${userId}/assign-role/`, { role });
};

export const changeUserPassword = (userId, oldPassword, newPassword) => {
    return request.post(`/users/${userId}/change-password/`, {
        old_password: oldPassword,
        new_password: newPassword
    });
};

export const getUserActivity = (userId, params = {}) => {
    return request.get(`/users/${userId}/activity/`, { params });
};

export const getMyActivity = (params = {}) => {
    return request.get('/users/me/activity/', { params });
};

// ============================================================
// TEAM MANAGEMENT
// ============================================================
export const getTeam = (userId) => {
    return request.get(`/users/${userId}/team/`);
};

export const getMyTeam = () => {
    return request.get('/users/me/team/');
};

export const getReportingChain = (userId) => {
    return request.get(`/users/${userId}/reporting-chain/`);
};

export const getMyReportingChain = () => {
    return request.get('/users/me/reporting-chain/');
};

// ============================================================
// USER ACTIVITY
// ============================================================
export const getUserLoginHistory = (userId, params = {}) => {
    return request.get(`/users/${userId}/activity/`, { params });
};

export const getMyLoginHistory = (params = {}) => {
    return request.get('/users/me/activity/', { params });
};

// ============================================================
// INVITATIONS
// ============================================================
export const inviteUser = (email, role, message = '') => {
    return request.post('/users/invite/', { email, role, message });
};

// ============================================================
// CONVENIENCE API OBJECT
// ============================================================
export const usersApi = {
    // CRUD
    getUsers,
    getUserById,
    getCurrentUser,
    createUser,
    updateUser,
    deleteUser,

    // Profile
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    removeAvatar,
    getMyProfile,
    getProfileByUserId,

    // Actions
    activateUser,
    deactivateUser,
    unlockUser,
    assignRole,
    changeUserPassword,
    getUserActivity,
    getMyActivity,

    // Team
    getTeam,
    getMyTeam,
    getReportingChain,
    getMyReportingChain,

    // Activity
    getUserLoginHistory,
    getMyLoginHistory,

    // Invitations
    inviteUser,
};

export default usersApi;