import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { departmentService } from '../../services/structure/department.service';
import { STRUCTURE_QUERY_KEYS, DEFAULT_PAGE_SIZE } from '../../config/constants/structureConstants';

export const useDepartments = (filters = {}, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const params = { page, page_size: pageSize, ...filters };

  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENTS, params],
    queryFn: () => departmentService.list(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useInfiniteDepartments = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENTS, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => departmentService.list({ page: pageParam, page_size: DEFAULT_PAGE_SIZE, ...filters }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.data?.next) {
        return pages.length + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDepartmentStats = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENTS, 'stats'],
    queryFn: () => departmentService.getStats(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useRootDepartments = (includeInactive = false) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENTS, 'root', { includeInactive }],
    queryFn: () => departmentService.getRootDepartments({ include_inactive: includeInactive }),
    staleTime: 5 * 60 * 1000,
  });
};