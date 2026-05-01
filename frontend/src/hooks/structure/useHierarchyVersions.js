import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hierarchyService } from '../../services/structure/hierarchy.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useHierarchyVersions = (limit = 20) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_VERSIONS, { limit }],
    queryFn: () => hierarchyService.getVersionHistory(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCurrentHierarchyVersion = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_VERSION, 'current'],
    queryFn: () => hierarchyService.getCurrentVersion(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHierarchyVersion = (versionId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_VERSION, versionId],
    queryFn: () => hierarchyService.getVersion(versionId),
    enabled: !!versionId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useHierarchyVersionMutations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const captureSnapshot = useMutation({
    mutationFn: (data) => hierarchyService.captureSnapshot(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.HIERARCHY_VERSIONS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.HIERARCHY_VERSION, 'current']);
      dispatch(showToast({ message: 'Hierarchy snapshot captured successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to capture snapshot', type: 'error' }));
      throw error;
    },
  });
  const restoreVersion = useMutation({
    mutationFn: (versionId) => hierarchyService.restoreVersion(versionId),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.HIERARCHY_VERSIONS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.HIERARCHY_VERSION, 'current']);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENTS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.TEAMS]);
      dispatch(showToast({ message: 'Hierarchy restored successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to restore hierarchy', type: 'error' }));
      throw error;
    },
  });
  const compareVersions = useMutation({
    mutationFn: ({ versionAId, versionBId }) => hierarchyService.compareVersions(versionAId, versionBId),
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to compare versions', type: 'error' }));
      throw error;
    },
  });
  const autoCapture = useMutation({
    mutationFn: () => hierarchyService.autoCapture(),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.HIERARCHY_VERSIONS]);
      return response;
    },
  });
  return {
    captureSnapshot,
    restoreVersion,
    compareVersions,
    autoCapture,
    isCapturing: captureSnapshot.isLoading,
    isRestoring: restoreVersion.isLoading,
    isComparing: compareVersions.isLoading,
    isAutoCapturing: autoCapture.isLoading,
  };
};

export const useVersionComparison = (versionAId, versionBId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_VERSIONS, 'compare', versionAId, versionBId],
    queryFn: () => hierarchyService.compareVersions(versionAId, versionBId),
    enabled: !!versionAId && !!versionBId,
    staleTime: 10 * 60 * 1000,
  });
};