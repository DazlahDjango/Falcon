import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotaService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useQuota = () => {
  const queryClient = useQueryClient();

  const useQuotas = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.QUOTAS, params],
      queryFn: () => quotaService.getQuotas(params),
      staleTime: 60000,
      ...options
    });
  };

  const useQuota = (quotaId, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.QUOTA, quotaId],
      queryFn: () => quotaService.getQuota(quotaId),
      enabled: !!quotaId,
      staleTime: 60000,
      ...options
    });
  };

  const useOverThreshold = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.QUOTAS, 'over-threshold'],
      queryFn: () => quotaService.getOverThreshold(),
      staleTime: 30000,
      ...options
    });
  };

  const useExceededQuotas = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.QUOTAS, 'exceeded'],
      queryFn: () => quotaService.getExceededQuotas(),
      staleTime: 30000,
      ...options
    });
  };

  const updateQuota = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.UPDATE_QUOTA],
    mutationFn: ({ quotaId, data }) => quotaService.updateQuota(quotaId, data),
    onSuccess: (_, { quotaId }) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.QUOTA, quotaId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.QUOTAS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_OVERVIEW] });
    }
  });

  return {
    useQuotas,
    useQuota,
    useOverThreshold,
    useExceededQuotas,
    updateQuota
  };
};