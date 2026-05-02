import { useQuery, useMutation } from '@tanstack/react-query';
import { hierarchyService } from '../../services/structure/hierarchy.service';
import { dashboardService } from '../../services/structure/dashboard.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useHierarchyHealth = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_HEALTH],
    queryFn: () => dashboardService.getHealthMetrics(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHierarchyHealthScore = () => {
  const { data, isLoading } = useHierarchyHealth();
  return {
    score: data?.data?.health_score || 0,
    status: data?.data?.status || 'unknown',
    issues: data?.data?.issues || [],
    isLoading,
  };
};

export const useHierarchyValidation = () => {
  const dispatch = useDispatch();
  const validateHierarchy = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_HEALTH, 'validate'],
    queryFn: () => hierarchyService.validateHierarchy(),
    staleTime: 5 * 60 * 1000,
  });
  const detectCycles = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_HEALTH, 'cycles'],
    queryFn: () => hierarchyService.detectCycles(),
    staleTime: 5 * 60 * 1000,
  });
  const repairCycles = useMutation({
    mutationFn: (dryRun = true) => hierarchyService.repairCycles(dryRun),
    onSuccess: (response) => {
      dispatch(showToast({ message: response.data?.message || 'Cycles repaired successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to repair cycles', type: 'error' }));
      throw error;
    },
  });
  const runIntegrityCheck = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_HEALTH, 'integrity'],
    queryFn: () => structureAdminService.runIntegrityCheck(),
    staleTime: 5 * 60 * 1000,
  });
  return {
    validateHierarchy,
    detectCycles,
    repairCycles,
    runIntegrityCheck,
    isRepairing: repairCycles.isLoading,
    hasCycles: (detectCycles.data?.data?.department_cycles || 0) > 0 || (detectCycles.data?.data?.team_cycles || 0) > 0,
  };
};

export const useOrphanedNodes = () => {
  const dispatch = useDispatch();
  const getOrphanedNodes = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_HEALTH, 'orphaned'],
    queryFn: () => structureAdminService.getOrphanedNodes(),
    staleTime: 5 * 60 * 1000,
  });
  const repairOrphanedNodes = useMutation({
    mutationFn: (dryRun = true) => structureAdminService.repairOrphanedNodes(dryRun),
    onSuccess: (response) => {
      dispatch(showToast({ message: response.data?.message || 'Orphaned nodes repaired successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to repair orphaned nodes', type: 'error' }));
      throw error;
    },
  });
  return {
    orphanedNodes: getOrphanedNodes.data?.data,
    isLoading: getOrphanedNodes.isLoading,
    repairOrphanedNodes,
    isRepairing: repairOrphanedNodes.isLoading,
  };
};