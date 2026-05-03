import { useQuery } from '@tanstack/react-query';
import { departmentService } from '../../services/structure/department.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';

export const useDepartmentTree = (includeInactive = false) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT_TREE, { includeInactive }],
    queryFn: () => departmentService.getTree({ include_inactive: includeInactive }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDepartmentSubtree = (rootId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT_TREE, rootId, 'subtree'],
    queryFn: () => departmentService.getBranch(rootId),
    enabled: !!rootId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDepartmentLCA = (deptAId, deptBId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT_TREE, 'lca', deptAId, deptBId],
    queryFn: () => departmentService.findLCA(deptAId, deptBId),
    enabled: !!deptAId && !!deptBId,
    staleTime: 10 * 60 * 1000,
  });
};