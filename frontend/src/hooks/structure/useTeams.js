import { useQuery } from '@tanstack/react-query';
import { teamService } from '../../services/structure/team.service';
import { normalizeStructureListPage } from '../../services/structure/structureResponse';
import { STRUCTURE_QUERY_KEYS, DEFAULT_PAGE_SIZE } from '../../config/constants/structureConstants';

export const useTeams = (filters = {}, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const params = { page, page_size: pageSize, ...filters };
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.TEAMS, params],
    queryFn: () => teamService.list(params),
    select: normalizeStructureListPage,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useTeamsByDepartment = (departmentId, filters = {}) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.TEAMS, 'department', departmentId, filters],
    queryFn: () => teamService.getByDepartment(departmentId, filters),
    select: normalizeStructureListPage,
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeamStats = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.TEAMS, 'stats'],
    queryFn: () => teamService.getStats(),
    select: (r) => (r && typeof r === 'object' && 'data' in r ? r.data : r),
    staleTime: 10 * 60 * 1000,
  });
};