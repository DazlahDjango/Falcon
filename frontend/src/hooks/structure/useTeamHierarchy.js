import { useQuery } from '@tanstack/react-query';
import { teamService } from '../../services/structure/team.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';

export const useTeamHierarchy = (departmentId, includeInactive = false) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.TEAM_HIERARCHY, departmentId, { includeInactive }],
    queryFn: () => teamService.getHierarchy(departmentId, { include_inactive: includeInactive }),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeamSubtree = (teamId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.TEAM_HIERARCHY, teamId, 'subtree'],
    queryFn: () => teamService.getSubtree(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
};