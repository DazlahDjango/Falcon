import { useSelector, useDispatch } from 'react-redux';
import {
  fetchSettings,
  updateSettings,
  clearSettings,
} from '../../store/organisation/slice/settingsSlice';
import {
  fetchBranding,
  updateBranding,
  uploadLogo,
  clearBranding,
} from '../../store/organisation/slice/brandingSlice';

export const useSettings = () => {
  const dispatch = useDispatch();
  const { settings, loading: settingsLoading, error: settingsError } = useSelector(
    (state) => state.settings
  );
  const { branding, loading: brandingLoading, error: brandingError } = useSelector(
    (state) => state.branding
  );

  // Settings methods
  const getSettings = () => {
    return dispatch(fetchSettings()).unwrap();
  };

  const updateOrgSettings = (data) => {
    return dispatch(updateSettings(data)).unwrap();
  };

  // Branding methods
  const getBranding = () => {
    return dispatch(fetchBranding()).unwrap();
  };

  const updateOrgBranding = (data) => {
    return dispatch(updateBranding(data)).unwrap();
  };

  const uploadOrgLogo = (file) => {
    return dispatch(uploadLogo(file)).unwrap();
  };

  const clear = () => {
    dispatch(clearSettings());
    dispatch(clearBranding());
  };

  return {
    // Settings
    settings,
    settingsLoading,
    settingsError,
    getSettings,
    updateSettings: updateOrgSettings,
    // Branding
    branding,
    brandingLoading,
    brandingError,
    getBranding,
    updateBranding: updateOrgBranding,
    uploadLogo: uploadOrgLogo,
    // Common
    clear,
  };
};