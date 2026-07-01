export const selectProfilesState = (state) => state.profiles || {};

export const selectProfiles = (state) => state.profiles?.profiles || [];

export const selectSelectedProfile = (state) => state.profiles?.selectedProfile || null;

export const selectCurrentProfile = (state) => state.profiles?.currentProfile || null;

export const selectSkills = (state) => state.profiles?.selectedProfile?.skills || [];

export const selectCertifications = (state) => state.profiles?.selectedProfile?.certifications || [];

export const selectMySkills = (state) => state.profiles?.currentProfile?.skills || [];

export const selectMyCertifications = (state) => state.profiles?.currentProfile?.certifications || [];

export const selectProfilesLoading = (state) => state.profiles?.isLoading || false;

export const selectProfilesUpdating = (state) => state.profiles?.isUpdating || false;

export const selectProfilesUploading = (state) => state.profiles?.isUploading || false;

export const selectProfilesError = (state) => state.profiles?.error || null;

export const selectProfilesPagination = (state) => state.profiles?.pagination || { page: 1, pageSize: 20, total: 0 };

export const selectProfilesPage = (state) => state.profiles?.pagination?.page || 1;

export const selectProfilesTotal = (state) => state.profiles?.pagination?.total || 0;

export const selectProfilesFilters = (state) => state.profiles?.filters || {};

export const selectProfileById = (state, id) => {
  const profiles = state.profiles?.profiles || [];
  return profiles.find(p => p.id === id) || null;
};

export const selectProfileByUserId = (state, userId) => {
  const profiles = state.profiles?.profiles || [];
  return profiles.find(p => p.user?.id === userId) || null;
};

export const selectProfileAvatar = (state) => {
  const profile = state.profiles?.currentProfile || state.profiles?.selectedProfile;
  return profile?.avatar || null;
};

export const selectProfileCompletion = (state) => {
  const profile = state.profiles?.currentProfile || state.profiles?.selectedProfile;
  if (!profile) return 0;
  const fields = ['avatar', 'bio', 'date_of_birth', 'work_phone', 'mobile_phone', 'address', 'city', 'country'];
  const completed = fields.filter(f => profile[f] !== null && profile[f] !== undefined && profile[f] !== '');
  return Math.round((completed.length / fields.length) * 100);
};

export const selectSkillsCount = (state) => {
  const skills = state.profiles?.selectedProfile?.skills || state.profiles?.currentProfile?.skills || [];
  return skills.length;
};

export const selectCertificationsCount = (state) => {
  const certs = state.profiles?.selectedProfile?.certifications || state.profiles?.currentProfile?.certifications || [];
  return certs.length;
};