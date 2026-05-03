import { useQuery } from '@tanstack/react-query';
import { reportingService } from '../../services/structure/reporting.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { useAuth } from '../accounts/useAuth';

export const useReportingChainUp = (userId, includeSelf = true) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_CHAIN, userId, 'up', { includeSelf }],
    queryFn: () => reportingService.getChainUp(userId, includeSelf),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });
};

export const useReportingChainDown = (userId, includeIndirect = true, maxDepth = 10) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_CHAIN, userId, 'down', { includeIndirect, maxDepth }],
    queryFn: () => reportingService.getChainDown(userId, includeIndirect, maxDepth),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });
};

export const useMyReportingChain = () => {
  const { user } = useAuth();
  const chainUp = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_CHAIN, user?.id, 'my', 'up'],
    queryFn: () => reportingService.getMyChain(),
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000,
  });
  const chainDown = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_CHAIN, user?.id, 'my', 'down'],
    queryFn: () => reportingService.getMyTeam(),
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000,
  });
  return { chainUp, chainDown };
};

export const useIsManagerOf = (managerId, employeeId) => {
  const { data: chain } = useReportingChainUp(employeeId, false);
  const isManager = chain?.data?.some(m => m.user_id === managerId) || false;
  return { isManager, isLoading: !chain };
};