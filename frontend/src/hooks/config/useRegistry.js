import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registryService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useRegistry = () => {
  const queryClient = useQueryClient();

  const useRegisteredApps = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.REGISTERED_APPS, params],
      queryFn: () => registryService.getRegisteredApps(params),
      staleTime: 300000,
      ...options
    });
  };

  const useApp = (appId, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.REGISTERED_APPS, appId],
      queryFn: () => registryService.getApp(appId),
      enabled: !!appId,
      staleTime: 300000,
      ...options
    });
  };

  const useRecoverySequence = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.RECOVERY_SEQUENCE],
      queryFn: () => registryService.getRecoverySequence(),
      staleTime: 3600000,
      ...options
    });
  };

  const usePriorityOrder = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.PRIORITY_ORDER],
      queryFn: () => registryService.getPriorityOrder(),
      staleTime: 3600000,
      ...options
    });
  };

  const useAppDependencies = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.APP_DEPENDENCIES, params],
      queryFn: () => registryService.getDependencies(params),
      staleTime: 300000,
      ...options
    });
  };

  const registerV1Apps = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.REGISTER_V1_APPS],
    mutationFn: () => registryService.registerV1Apps(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.REGISTERED_APPS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.RECOVERY_SEQUENCE] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.PRIORITY_ORDER] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.APP_DEPENDENCIES] });
    }
  });

  const syncRegistry = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.SYNC_REGISTRY],
    mutationFn: (appNames) => registryService.syncRegistry(appNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.REGISTERED_APPS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.RECOVERY_SEQUENCE] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.PRIORITY_ORDER] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.APP_DEPENDENCIES] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.REGISTRY_DEFINITIONS] });
    }
  });

  const useRegistryDefinitions = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.REGISTRY_DEFINITIONS],
      queryFn: () => registryService.getDefinitions(),
      staleTime: 3600000,
      ...options
    });
  };

  const updateApp = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.UPDATE_APP],
    mutationFn: ({ appId, data }) => registryService.updateApp(appId, data),
    onSuccess: (_, { appId }) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.REGISTERED_APPS, appId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.REGISTERED_APPS] });
    }
  });

  const unregisterApp = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.UNREGISTER_APP],
    mutationFn: (appId) => registryService.unregisterApp(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.REGISTERED_APPS] });
    }
  });

  const createDependency = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CREATE_DEPENDENCY],
    mutationFn: (data) => registryService.createDependency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.APP_DEPENDENCIES] });
    }
  });

  const deleteDependency = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.DELETE_DEPENDENCY],
    mutationFn: (dependencyId) => registryService.deleteDependency(dependencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.APP_DEPENDENCIES] });
    }
  });

  return {
    useRegisteredApps,
    useApp,
    useRecoverySequence,
    usePriorityOrder,
    useAppDependencies,
    useRegistryDefinitions,
    registerV1Apps,
    syncRegistry,
    updateApp,
    unregisterApp,
    createDependency,
    deleteDependency
  };
};