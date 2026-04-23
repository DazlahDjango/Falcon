import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  clearTeams,
} from '../../store/organisations/slice/teamSlice';
import {
  fetchBranding,
  updateBranding,
  uploadLogo,
  removeLogo,
} from '../../store/organisations/slice/brandingSlice';

export const useTeams = () => {
  const dispatch = useDispatch();
  const { teams, total, loading, error } = useSelector(
    (state) => state.teams
  );
  const { branding, loading: brandingLoading, error: brandingError } = useSelector(
    (state) => state.branding
  );

  const getTeams = (params = {}) => {
    dispatch(fetchTeams(params));
  };

  const addTeam = (data) => {
    return dispatch(createTeam(data)).unwrap();
  };

  const editTeam = (id, data) => {
    return dispatch(updateTeam({ id, data })).unwrap();
  };

  const removeTeam = (id) => {
    return dispatch(deleteTeam(id)).unwrap();
  };

  const clear = () => {
    dispatch(clearTeams());
  };

  // Theme/Branding functions
  const getTheme = () => {
    dispatch(fetchBranding());
  };

  const updateTheme = (data) => {
    return dispatch(updateBranding(data)).unwrap();
  };

  const toggleDarkMode = () => {
    // Toggle dark mode in branding
    const currentMode = branding?.theme?.darkMode || false;
    return dispatch(updateBranding({ theme: { darkMode: !currentMode } })).unwrap();
  };

  const uploadLogoFile = (file) => {
    return dispatch(uploadLogo(file)).unwrap();
  };

  const removeLogoFile = () => {
    return dispatch(removeLogo()).unwrap();
  };

  const refreshTheme = () => {
    dispatch(fetchBranding());
  };

  return {
    teams,
    total,
    loading,
    error,
    getTeams,
    addTeam,
    editTeam,
    removeTeam,
    clearTeams: clear,
    // Theme/Branding
    theme: branding,
    brandingLoading,
    brandingError,
    getTheme,
    updateTheme,
    toggleDarkMode,
    uploadLogo: uploadLogoFile,
    removeLogo: removeLogoFile,
    refreshTheme,
  };
};

export const useTheme = () => {
  const dispatch = useDispatch();
  const { branding, loading, error } = useSelector(
    (state) => state.branding
  );

  const getTheme = () => {
    dispatch(fetchBranding());
  };

  const updateTheme = (data) => {
    return dispatch(updateBranding(data)).unwrap();
  };

  const toggleDarkMode = () => {
    const currentMode = branding?.theme?.darkMode || false;
    return dispatch(updateBranding({ theme: { darkMode: !currentMode } })).unwrap();
  };

  const uploadLogo = (file) => {
    return dispatch(uploadLogo(file)).unwrap();
  };

  const removeLogo = () => {
    return dispatch(removeLogo()).unwrap();
  };

  const refreshTheme = () => {
    dispatch(fetchBranding());
  };

  return {
    theme: branding,
    loading,
    error,
    getTheme,
    updateTheme,
    toggleDarkMode,
    uploadLogo,
    removeLogo,
    refreshTheme,
  };
};