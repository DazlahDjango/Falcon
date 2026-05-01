import { useQuery } from '@tanstack/react-query';
import { employmentService } from '../../services/structure/employment.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { useAuth } from '../accounts/useAuth';

export const useCurrentEmployment = (options = {}) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.CURRENT_EMPLOYMENT, user?.id],
    queryFn: () => employmentService.getMyEmployment(),
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000,
    ...options,
  });
};

export const useIsManager = () => {
  const { data: employment } = useCurrentEmployment();
  return employment?.data?.is_manager || false;
};

export const useIsExecutive = () => {
  const { data: employment } = useCurrentEmployment();
  return employment?.data?.is_executive || false;
};

export const useMyDirectReports = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_CHAIN, user?.id, 'directReports'],
    queryFn: () => employmentService.getTeamMembers(user?.id, false),
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000,
  });
};