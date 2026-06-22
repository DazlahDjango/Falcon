import { request } from './client';

// Profile API
export const getProfiles = (params = {}) => {
    return request.get('/profiles/', { params });
};

export const getProfileById = (profileId) => {
    return request.get(`/profiles/${profileId}/`);
};

export const getMyProfile = () => {
    return request.get('/profiles/my/');
};

export const updateMyProfile = (data) => {
    return request.patch('/profiles/my/', data);
};

// Avatar Management
export const uploadAvatar = (profileId, formData, onProgress) => {
    return request.post(`/profiles/${profileId}/avatar/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total))
    });
};

export const deleteAvatar = (profileId) => {
    return request.delete(`/profiles/${profileId}/avatar/`);
};

// Skills Management
export const addSkill = (profileId, data) => {
    return request.post(`/profiles/${profileId}/skills/`, data);
};

export const updateSkill = (profileId, skillName, data) => {
    return request.patch(`/profiles/${profileId}/skills/${skillName}/`, data);
};

export const removeSkill = (profileId, skillName) => {
    return request.delete(`/profiles/${profileId}/skills/${skillName}/`);
};

export const getSkillsSummary = (profileId) => {
    return request.get(`/profiles/${profileId}/skills-summary/`);
};

// Certifications Management
export const addCertification = (profileId, data) => {
    return request.post(`/profiles/${profileId}/certifications/`, data);
};

export const removeCertification = (profileId, certName) => {
    return request.delete(`/profiles/${profileId}/certifications/${certName}/`);
};

export const getCertificationsSummary = (profileId) => {
    return request.get(`/profiles/${profileId}/certifications-summary/`);
};

export const profilesApi = {
    getProfiles,
    getProfileById,
    getMyProfile,
    updateMyProfile,
    uploadAvatar,
    deleteAvatar,
    addSkill,
    updateSkill,
    removeSkill,
    getSkillsSummary,
    addCertification,
    removeCertification,
    getCertificationsSummary,
};

export default profilesApi;