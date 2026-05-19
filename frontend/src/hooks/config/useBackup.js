import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backupService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useBackup = () => {
  const queryClient = useQueryClient();

  const useBackupJobs = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.BACKUP_JOBS, params],
      queryFn: () => backupService.list(params),
      staleTime: 30000,
      refetchInterval: 10000,
      ...options
    });
  };

  const useBackupJob = (jobId, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.BACKUP_JOB, jobId],
      queryFn: () => backupService.getById(jobId),
      enabled: !!jobId,
      staleTime: 30000,
      ...options
    });
  };

  const useBackupPolicies = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.BACKUP_POLICIES, params],
      queryFn: () => backupService.getPolicies(params),
      staleTime: 60000,
      ...options
    });
  };

  const useBackupArtifacts = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.BACKUP_ARTIFACTS, params],
      queryFn: () => backupService.getArtifacts(params),
      staleTime: 30000,
      ...options
    });
  };

  const triggerBackup = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.TRIGGER_BACKUP],
    mutationFn: ({ appName, backupType }) => backupService.triggerBackup(appName, backupType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_JOBS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_BACKUP] });
    }
  });

  const cancelBackup = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CANCEL_BACKUP],
    mutationFn: (jobId) => backupService.cancelBackup(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_JOB, jobId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_JOBS] });
    }
  });

  const restoreBackup = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.RESTORE_BACKUP],
    mutationFn: ({ jobId, targetAppOnly }) => backupService.restoreBackup(jobId, targetAppOnly),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_JOB, jobId] });
    }
  });

  const verifyBackup = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.VERIFY_BACKUP],
    mutationFn: (jobId) => backupService.verifyBackup(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_JOB, jobId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_ARTIFACTS] });
    }
  });

  const applyRetention = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.APPLY_RETENTION],
    mutationFn: (appId) => backupService.applyRetention(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_JOBS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_ARTIFACTS] });
    }
  });

  const updatePolicy = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.UPDATE_POLICY],
    mutationFn: ({ policyId, data }) => backupService.updatePolicy(policyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_POLICIES] });
    }
  });

  const deleteArtifact = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.DELETE_ARTIFACT],
    mutationFn: (artifactId) => backupService.deleteArtifact(artifactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.BACKUP_ARTIFACTS] });
    }
  });

  return {
    useBackupJobs,
    useBackupJob,
    useBackupPolicies,
    useBackupArtifacts,
    triggerBackup,
    cancelBackup,
    restoreBackup,
    verifyBackup,
    applyRetention,
    updatePolicy,
    deleteArtifact
  };
};