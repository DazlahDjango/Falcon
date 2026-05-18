import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disasterRecoveryService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useDisasterRecovery = () => {
  const queryClient = useQueryClient();

  const useDRPlans = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DR_PLANS, params],
      queryFn: () => disasterRecoveryService.getPlans(params),
      staleTime: 60000,
      ...options
    });
  };

  const useDRPlan = (planId, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DR_PLAN, planId],
      queryFn: () => disasterRecoveryService.getPlan(planId),
      enabled: !!planId,
      staleTime: 60000,
      ...options
    });
  };

  const useDRExecutions = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DR_EXECUTIONS, params],
      queryFn: () => disasterRecoveryService.getExecutions(params),
      staleTime: 30000,
      ...options
    });
  };

  const useDRMetrics = (appName = null, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DR_METRICS, appName],
      queryFn: () => disasterRecoveryService.getMetrics(appName),
      staleTime: 300000,
      ...options
    });
  };

  const createDRPlan = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CREATE_DR_PLAN],
    mutationFn: (data) => disasterRecoveryService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_PLANS] });
    }
  });

  const updateDRPlan = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.UPDATE_DR_PLAN],
    mutationFn: ({ planId, data }) => disasterRecoveryService.updatePlan(planId, data),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_PLAN, planId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_PLANS] });
    }
  });

  const deleteDRPlan = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.DELETE_DR_PLAN],
    mutationFn: (planId) => disasterRecoveryService.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_PLANS] });
    }
  });

  const executeDRPlan = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.EXECUTE_DR],
    mutationFn: ({ planId, executionType }) => disasterRecoveryService.executePlan(planId, executionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_EXECUTIONS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_METRICS] });
    }
  });

  const runDRDrill = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.RUN_DR_DRILL],
    mutationFn: (planId) => disasterRecoveryService.runDrill(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_PLAN] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_EXECUTIONS] });
    }
  });

  const failover = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.FAILOVER],
    mutationFn: (executionId) => disasterRecoveryService.failover(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_EXECUTIONS] });
    }
  });

  const failback = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.FAILBACK],
    mutationFn: (executionId) => disasterRecoveryService.failback(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DR_EXECUTIONS] });
    }
  });

  return {
    useDRPlans,
    useDRPlan,
    useDRExecutions,
    useDRMetrics,
    createDRPlan,
    updateDRPlan,
    deleteDRPlan,
    executeDRPlan,
    runDRDrill,
    failover,
    failback
  };
};