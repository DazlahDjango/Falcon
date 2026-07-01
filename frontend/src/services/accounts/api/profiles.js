import { request } from './client';
import { PROFILE_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getProfiles = (params) => request.get(PROFILE_ENDPOINTS.LIST, { params });

export const getProfile = (id) => request.get(PROFILE_ENDPOINTS.DETAIL(id));

export const updateProfile = (id, data) => request.patch(PROFILE_ENDPOINTS.UPDATE(id), data);

export const deleteProfile = (id) => request.delete(PROFILE_ENDPOINTS.DELETE(id));

export const uploadAvatar = (id, formData, onProgress) =>
  request.post(PROFILE_ENDPOINTS.UPLOAD_AVATAR(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

export const deleteAvatar = (id) => request.delete(PROFILE_ENDPOINTS.DELETE_AVATAR(id));

export const addSkill = (id, data) => request.post(PROFILE_ENDPOINTS.SKILLS(id), data);

export const updateSkill = (id, skillName, data) =>
  request.put(PROFILE_ENDPOINTS.SKILL_DETAIL(id, skillName), data);

export const removeSkill = (id, skillName) =>
  request.delete(PROFILE_ENDPOINTS.SKILL_DETAIL(id, skillName));

export const getSkillsSummary = (id) => request.get(PROFILE_ENDPOINTS.SKILLS_SUMMARY(id));

export const addCertification = (id, data) =>
  request.post(PROFILE_ENDPOINTS.CERTIFICATIONS(id), data);

export const removeCertification = (id, certName) =>
  request.delete(PROFILE_ENDPOINTS.CERTIFICATION_DETAIL(id, certName));

export const getCertificationsSummary = (id) =>
  request.get(PROFILE_ENDPOINTS.CERTIFICATIONS_SUMMARY(id));

export const getMyProfile = () => request.get(PROFILE_ENDPOINTS.MY_PROFILE);

export const updateMyProfile = (data) => request.patch(PROFILE_ENDPOINTS.MY_PROFILE, data);

export const getMySkillsSummary = () => request.get(PROFILE_ENDPOINTS.MY_SKILLS_SUMMARY);

export const getMyCertificationsSummary = () =>
  request.get(PROFILE_ENDPOINTS.MY_CERTIFICATIONS_SUMMARY);