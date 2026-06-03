import { request } from './client';

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

export const uploadAvatar = (formData, onProgress) => {
    return request.post('/users/me/avatar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total))
    });
};

export const deleteAvatar = () => {
    return request.delete('/users/me/avatar/');
};

export const removeAvatar = (userId) => {
    if (userId && userId !== 'me') {
        return request.delete(`/users/${userId}/avatar/`);
    }
    return deleteAvatar();
};

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

// Team Management
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

export const getUserLoginHistory = (userId, params = {}) => {
    return request.get(`/users/${userId}/activity/`, { params });
};

export const getMyLoginHistory = (params = {}) => {
    return request.get('/users/me/activity/', { params });
};

export const inviteUser = (email, role, message = '') => {
    return request.post('/users/invite/', { email, role, message });
};
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

    // Actions
    activateUser,
    deactivateUser,
    unlockUser,
    assignRole,
    changeUserPassword,

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