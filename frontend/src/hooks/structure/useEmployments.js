import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { employmentService } from '../../services/structure/employment.service';
import { normalizeStructureListPage, normalizeStructureResultsArray, normalizeStructureEntity } from '../../services/structure/structureResponse';
import { STRUCTURE_QUERY_KEYS, DEFAULT_PAGE_SIZE } from '../../config/constants/structureConstants';

export const useEmployments = (filters = {}, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const params = { page, page_size: pageSize, ...filters };

  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.EMPLOYMENTS, params],
    queryFn: () => employmentService.list(params),
    select: normalizeStructureListPage,
    staleTime: 3 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useCurrentEmployments = (filters = {}) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.EMPLOYMENTS, 'current', filters],
    queryFn: () => employmentService.getCurrent(filters),
    select: normalizeStructureResultsArray,
    staleTime: 3 * 60 * 1000,
  });
};

export const useEmploymentsByUser = (userId, includeHistory = true) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.EMPLOYMENTS, 'user', userId, { includeHistory }],
    queryFn: () => employmentService.getByUser(userId, includeHistory),
    select: normalizeStructureResultsArray,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmploymentDepartmentStats = (departmentId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.EMPLOYMENTS, 'stats', departmentId],
    queryFn: () => employmentService.getDepartmentStats(departmentId),
    select: normalizeStructureEntity,
    enabled: !!departmentId,
    staleTime: 10 * 60 * 1000,
  });
};