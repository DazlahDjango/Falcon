import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useHealthCheck = () => {
  const queryClient = useQueryClient();

  const useHealthChecks = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.HEALTH_CHECKS, params],
      queryFn: () => healthService.getHealthChecks(params),
      staleTime: 30000,
      refetchInterval: 60000,
      ...options
    });
  };

  const useLatestHealth = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.HEALTH_CHECKS, 'latest', params],
      queryFn: () => healthService.getLatestHealth(params),
      staleTime: 15000,
      refetchInterval: 30000,
      ...options
    });
  };

  const useHealthHistory = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.HEALTH_HISTORY, params],
      queryFn: () => healthService.getHealthHistory(params),
      staleTime: 60000,
      ...options
    });
  };

  const useSystemMetrics = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.HEALTH_METRICS],
      queryFn: () => healthService.getSystemMetrics(),
      staleTime: 30000,
      refetchInterval: 60000,
      ...options
    });
  };

  const checkAllApps = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CHECK_ALL_HEALTH],
    mutationFn: () => healthService.checkAllApps(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.HEALTH_CHECKS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_HEALTH] });
    }
  });

  const evaluateThresholds = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.EVALUATE_THRESHOLDS],
    mutationFn: (appName) => healthService.evaluateThresholds(appName),
  });

  const triggerConditionalMaintenance = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CONDITIONAL_MAINTENANCE],
    mutationFn: () => healthService.triggerConditionalMaintenance(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOWS] });
    }
  });

  return {
    useHealthChecks,
    useLatestHealth,
    useHealthHistory,
    useSystemMetrics,
    checkAllApps,
    evaluateThresholds,
    triggerConditionalMaintenance
  };
};