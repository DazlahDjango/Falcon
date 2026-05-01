import { useQuery } from '@tanstack/react-query';
import { reportingService } from '../../services/structure/reporting.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { useAuth } from '../accounts/useAuth';

export const useSpanOfControl = (userId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.SPAN_OF_CONTROL, userId],
    queryFn: () => reportingService.getSpanOfControl(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMySpanOfControl = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.SPAN_OF_CONTROL, user?.id, 'my'],
    queryFn: () => reportingService.getSpanOfControl(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrganizationSpan = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.SPAN_OF_CONTROL, 'organization'],
    queryFn: () => reportingService.getOrganizationSpan(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useSpanOfControlHealth = (userId) => {
  const { data, isLoading } = useSpanOfControl(userId);
  const isHealthy = data?.data?.direct_reports <= 15;
  const isWarning = data?.data?.direct_reports > 15 && data?.data?.direct_reports <= 20;
  const isCritical = data?.data?.direct_reports > 20;
  return {
    data,
    isLoading,
    isHealthy,
    isWarning,
    isCritical,
    directReports: data?.data?.direct_reports || 0,
    totalReports: data?.data?.total_reports || 0,
  };
};