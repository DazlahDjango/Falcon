import { useQuery, useMutation } from '@tanstack/react-query';
import { auditService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useAuditLog = () => {
  const useAuditLogs = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.AUDIT_LOGS, params],
      queryFn: () => auditService.getAuditLogs(params),
      staleTime: 60000,
      ...options
    });
  };

  const useAuditLog = (logId, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.AUDIT_LOGS, logId],
      queryFn: () => auditService.getAuditLog(logId),
      enabled: !!logId,
      staleTime: 60000,
      ...options
    });
  };

  const exportAuditLogs = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.EXPORT_AUDIT],
    mutationFn: ({ params, format }) => auditService.exportAuditLogs(params, format),
  });

  return {
    useAuditLogs,
    useAuditLog,
    exportAuditLogs
  };
};