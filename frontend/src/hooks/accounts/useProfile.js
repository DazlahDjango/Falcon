import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfiles,
  fetchProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  addSkill as addSkillThunk,
  updateSkill as updateSkillThunk,
  removeSkill as removeSkillThunk,
  addCertification as addCertificationThunk,
  removeCertification as removeCertificationThunk,
  fetchMyProfile as fetchMyProfileThunk,
  updateMyProfile as updateMyProfileThunk,
  setProfileFilters,
  setProfilePage,
  clearSelectedProfile,
  clearProfileError,
} from '../../store/accounts/slice/profileSlice';
import {
  selectProfiles,
  selectSelectedProfile,
  selectCurrentProfile,
  selectProfilesLoading,
  selectProfilesUpdating,
  selectProfilesUploading,
  selectProfilesError,
  selectProfilesPagination,
  selectProfilesFilters,
  selectProfileById,
  selectProfileByUserId,
  selectProfileAvatar,
  selectProfileCompletion,
  selectSkillsCount,
  selectCertificationsCount,
} from '../../store/accounts/selectors/profileSelectors';

export const useProfile = () => {
  const dispatch = useDispatch();
  const profiles = useSelector(selectProfiles);
  const selectedProfile = useSelector(selectSelectedProfile);
  const currentProfile = useSelector(selectCurrentProfile);
  const isLoading = useSelector(selectProfilesLoading);
  const isUpdating = useSelector(selectProfilesUpdating);
  const isUploading = useSelector(selectProfilesUploading);
  const error = useSelector(selectProfilesError);
  const pagination = useSelector(selectProfilesPagination);
  const filters = useSelector(selectProfilesFilters);

  const getProfiles = useCallback(
    async (params) => {
      const result = await dispatch(fetchProfiles(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getProfile = useCallback(
    async (id) => {
      const result = await dispatch(fetchProfile(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const update = useCallback(
    async (id, data) => {
      const result = await dispatch(updateProfile({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const upload = useCallback(
    async (arg1, file, onProgress) => {
      let payload;
      if (typeof arg1 === 'object' && arg1 !== null) {
        payload = arg1;
      } else {
        payload = { id: arg1, file, onProgress };
      }
      const result = await dispatch(uploadAvatar(payload)).unwrap();
      return result;
    },
    [dispatch]
  );

  const removeAvatar = useCallback(
    async (id) => {
      const result = await dispatch(deleteAvatar(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const addSkill = useCallback(
    async (id, data) => {
      const result = await dispatch(addSkillThunk({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const updateSkill = useCallback(
    async (id, skillName, data) => {
      const result = await dispatch(updateSkillThunk({ id, skillName, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const removeSkill = useCallback(
    async (id, skillName) => {
      const result = await dispatch(removeSkillThunk({ id, skillName })).unwrap();
      return result;
    },
    [dispatch]
  );

  const addCertification = useCallback(
    async (id, data) => {
      const result = await dispatch(addCertificationThunk({ id, data })).unwrap();
      return result;
    },
    [dispatch]
  );

  const removeCertification = useCallback(
    async (id, certName) => {
      const result = await dispatch(removeCertificationThunk({ id, certName })).unwrap();
      return result;
    },
    [dispatch]
  );

  const getMyProfile = useCallback(async () => {
    try {
      const result = await dispatch(fetchMyProfileThunk()).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [dispatch]);

  const updateMyProfile = useCallback(
    async (data) => {
      try {
        const result = await dispatch(updateMyProfileThunk(data)).unwrap();
        return { success: true, data: result };
      } catch (err) {
        return { success: false, error: err };
      }
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setProfileFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setProfilePage(page));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedProfile());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearProfileError());
  }, [dispatch]);

  const getProfileById = useCallback(
    (id) => {
      return selectProfileById({ profiles: { profiles } }, id);
    },
    [profiles]
  );

  const getProfileByUserId = useCallback(
    (userId) => {
      return selectProfileByUserId({ profiles: { profiles } }, userId);
    },
    [profiles]
  );

  const getAvatar = useCallback(() => {
    return selectProfileAvatar({ profiles: { currentProfile, selectedProfile } });
  }, [currentProfile, selectedProfile]);

  const getCompletion = useCallback(() => {
    return selectProfileCompletion({ profiles: { currentProfile, selectedProfile } });
  }, [currentProfile, selectedProfile]);

  return useMemo(
    () => ({
      profiles,
      selectedProfile,
      currentProfile,
      isLoading,
      isUpdating,
      isUploading,
      error,
      pagination,
      filters,
      getProfiles,
      getProfile,
      update,
      upload,
      uploadAvatar: upload,
      removeAvatar,
      deleteAvatar: removeAvatar,
      addSkill,
      updateSkill,
      removeSkill,
      addCertification,
      removeCertification,
      getMyProfile,
      updateMyProfile,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getProfileById,
      getProfileByUserId,
      getAvatar,
      getCompletion,
      clearSelectedProfile: clearSelected,
    }),
    [
      profiles,
      selectedProfile,
      currentProfile,
      isLoading,
      isUpdating,
      isUploading,
      error,
      pagination,
      filters,
      getProfiles,
      getProfile,
      update,
      upload,
      removeAvatar,
      addSkill,
      updateSkill,
      removeSkill,
      addCertification,
      removeCertification,
      getMyProfile,
      updateMyProfile,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getProfileById,
      getProfileByUserId,
      getAvatar,
      getCompletion,
    ]
  );
};