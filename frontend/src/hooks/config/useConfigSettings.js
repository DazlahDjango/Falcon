import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { settingsService } from '../../services/config/settings.service';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';
import { apiToReduxSettings } from '../../utils/config/settingsMapper';
import { hydrateFromApi, setLoading, setError } from '../../store/config/slices/configSettingsSlice';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useConfigSettings = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: [CONFIG_QUERY_KEYS.SYSTEM_SETTINGS],
    queryFn: async () => {
      dispatch(setLoading(true));
      const response = await settingsService.getSystemSettings();
      const data = response?.data ?? response;
      dispatch(hydrateFromApi(data));
      dispatch(setLoading(false));
      return data;
    },
    staleTime: 60000,
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.UPDATE_SYSTEM_SETTINGS],
    mutationFn: (patch) => settingsService.updateSystemSettings(patch),
    onSuccess: (response) => {
      const data = response?.data ?? response;
      dispatch(hydrateFromApi(data));
      queryClient.setQueryData([CONFIG_QUERY_KEYS.SYSTEM_SETTINGS], data);
      dispatch(showToast({ message: 'Settings saved successfully', type: 'success' }));
    },
    onError: (err) => {
      dispatch(showToast({ message: err?.message || 'Failed to save settings', type: 'error' }));
    },
  });

  const resetMutation = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.RESET_SYSTEM_SETTINGS],
    mutationFn: () => settingsService.resetSystemSettings(),
    onSuccess: (response) => {
      const data = response?.data ?? response;
      dispatch(hydrateFromApi(data));
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.SYSTEM_SETTINGS] });
      dispatch(showToast({ message: 'Settings reset to defaults', type: 'success' }));
    },
    onError: (err) => {
      dispatch(showToast({ message: err?.message || 'Failed to reset settings', type: 'error' }));
    },
  });

  const saveSection = (sectionKey, sectionData) => {
    return updateMutation.mutateAsync({ [sectionKey]: sectionData });
  };

  const saveAll = (sections) => {
    return updateMutation.mutateAsync(sections);
  };

  return {
    settings: query.data,
    reduxMapped: query.data ? apiToReduxSettings(query.data) : null,
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving: updateMutation.isPending,
    isResetting: resetMutation.isPending,
    refetch: query.refetch,
    saveSection,
    saveAll,
    resetToDefaults: resetMutation.mutateAsync,
  };
};
