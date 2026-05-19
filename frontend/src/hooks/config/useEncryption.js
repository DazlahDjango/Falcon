import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encryptionService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useEncryption = () => {
  const queryClient = useQueryClient();

  const useEncryptionKeys = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.ENCRYPTION_KEYS, params],
      queryFn: () => encryptionService.getKeys(params),
      staleTime: 300000,
      ...options
    });
  };

  const useEncryptionKey = (keyId, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.ENCRYPTION_KEY, keyId],
      queryFn: () => encryptionService.getKey(keyId),
      enabled: !!keyId,
      staleTime: 300000,
      ...options
    });
  };

  const useDefaultKey = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.ENCRYPTION_KEYS, 'default'],
      queryFn: () => encryptionService.getDefaultKey(),
      staleTime: 300000,
      ...options
    });
  };

  const useKeysNeedingRotation = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.ENCRYPTION_KEYS, 'needs-rotation'],
      queryFn: () => encryptionService.getKeysNeedingRotation(),
      staleTime: 86400000,
      ...options
    });
  };

  const createKey = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CREATE_KEY],
    mutationFn: (data) => encryptionService.createKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.ENCRYPTION_KEYS] });
    }
  });

  const rotateKey = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.ROTATE_KEY],
    mutationFn: ({ oldKeyId, newKeyAlias, keySource }) =>
      encryptionService.rotateKey(oldKeyId, newKeyAlias, keySource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.ENCRYPTION_KEYS] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_SECURITY] });
    }
  });

  const revokeKey = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.REVOKE_KEY],
    mutationFn: (keyId) => encryptionService.revokeKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.ENCRYPTION_KEYS] });
    }
  });

  return {
    useEncryptionKeys,
    useEncryptionKey,
    useDefaultKey,
    useKeysNeedingRotation,
    createKey,
    rotateKey,
    revokeKey
  };
};