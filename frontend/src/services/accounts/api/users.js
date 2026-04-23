import { request } from './client';

// User CRUD
// ===========

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

// Profiles Management
// ====================
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

// User Actions
// =============
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

// Team Management
// ==================
export const getTeam = (userId) => {
    return request.get(`/users/${userId}/team/`);
};
export const getMyTeam = () => {
    return request.get('/users/me/team/');
};
export const getReportingChain = (userId) => {
    return request.get(`/users/${userId}/reporting-chain/`);
};
export const getTeamHierarchy = () => {
    return request.get('/users/me/team/hierarchy/');
};
export const getTeamStats = () => {
    return request.get('/users/me/team/stats/');
};

// NEW: Additional exports needed by slices
// ==========================================

export const removeAvatar = (userId) => {
    // If removing avatar for a specific user (admin action)
    if (userId && userId !== 'me') {
        return request.delete(`/users/${userId}/avatar/`);
    }
    // For current user
    return deleteAvatar();
};

export const getUserActivity = (userId, params = {}) => {
    return request.get(`/users/${userId}/activity/`, { params });
};

export const getTeamActivities = (teamId, params = {}) => {
    return request.get(`/teams/${teamId}/activities/`, { params });
};