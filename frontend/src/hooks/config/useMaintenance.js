import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useMaintenance = () => {
  const queryClient = useQueryClient();

  const useMaintenanceWindows = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOWS, params],
      queryFn: () => maintenanceService.list(params),
      staleTime: 30000,
      refetchInterval: params.status === 'in_progress' ? 5000 : 30000,
      ...options
    });
  };

  const useMaintenanceWindow = (windowId, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOW, windowId],
      queryFn: () => maintenanceService.getById(windowId),
      enabled: !!windowId,
      staleTime: 30000,
      ...options
    });
  };

  const useMaintenanceLogs = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_LOGS, params],
      queryFn: () => maintenanceService.getLogs(params),
      staleTime: 60000,
      ...options
    });
  };

  const scheduleMaintenance = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CREATE_MAINTENANCE],
    mutationFn: ({ title, maintenanceType, scheduledStart, scheduledEnd, reason, affectedAppIds }) =>
      maintenanceService.scheduleMaintenance(title, maintenanceType, scheduledStart, scheduledEnd, reason, affectedAppIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOWS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_MAINTENANCE] });
    }
  });

  const startMaintenance = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.START_MAINTENANCE],
    mutationFn: (windowId) => maintenanceService.startMaintenance(windowId),
    onSuccess: (_, windowId) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOW, windowId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOWS] });
    }
  });

  const stopMaintenance = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.STOP_MAINTENANCE],
    mutationFn: (windowId) => maintenanceService.stopMaintenance(windowId),
    onSuccess: (_, windowId) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOW, windowId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOWS] });
    }
  });

  const cancelMaintenance = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CANCEL_MAINTENANCE],
    mutationFn: (windowId) => maintenanceService.cancelMaintenance(windowId),
    onSuccess: (_, windowId) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOW, windowId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOWS] });
    }
  });

  const runRiskAssessment = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.RUN_RISK_ASSESSMENT],
    mutationFn: () => maintenanceService.runRiskAssessment(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.MAINTENANCE_WINDOWS] });
    }
  });

  return {
    useMaintenanceWindows,
    useMaintenanceWindow,
    useMaintenanceLogs,
    scheduleMaintenance,
    startMaintenance,
    stopMaintenance,
    cancelMaintenance,
    runRiskAssessment
  };
};