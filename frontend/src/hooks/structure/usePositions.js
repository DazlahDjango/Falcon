import { useQuery } from '@tanstack/react-query';
import { positionService } from '../../services/structure/position.service';
import { STRUCTURE_QUERY_KEYS, DEFAULT_PAGE_SIZE } from '../../config/constants/structureConstants';

export const usePositions = (filters = {}, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const params = { page, page_size: pageSize, ...filters };
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.POSITIONS, params],
    queryFn: () => positionService.list(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useVacantPositions = (filters = {}) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.POSITIONS, 'vacant', filters],
    queryFn: () => positionService.getVacant(filters),
    staleTime: 3 * 60 * 1000,
  });
};

export const usePositionsByLevelRange = (minLevel, maxLevel) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.POSITIONS, 'level', { minLevel, maxLevel }],
    queryFn: () => positionService.getByLevelRange(minLevel, maxLevel),
    enabled: minLevel !== undefined && maxLevel !== undefined,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePositionStats = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.POSITIONS, 'stats'],
    queryFn: () => positionService.getStats(),
    staleTime: 10 * 60 * 1000,
  });
};