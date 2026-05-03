import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../../services/structure/department.service';
import { normalizeStructureEntity } from '../../services/structure/structureResponse';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useDepartment = (id, options = {}) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT, id],
    queryFn: () => departmentService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
    ...options,
    select: options.select ?? normalizeStructureEntity,
  });
};

export const useDepartmentByCode = (code, options = {}) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT, code, 'byCode'],
    queryFn: () => departmentService.getByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
    ...options,
    select: options.select ?? normalizeStructureEntity,
  });
};

export const useDepartmentMutations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const createDepartment = useMutation({
    mutationFn: (data) => departmentService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENTS]);
      dispatch(showToast({ message: 'Department created successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to create department', type: 'error' }));
      throw error;
    },
  });
  const updateDepartment = useMutation({
    mutationFn: ({ id, data }) => departmentService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENT, variables.id]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENTS]);
      dispatch(showToast({ message: 'Department updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update department', type: 'error' }));
      throw error;
    },
  });
  const deleteDepartment = useMutation({
    mutationFn: (id) => departmentService.delete(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENTS]);
      queryClient.removeQueries([STRUCTURE_QUERY_KEYS.DEPARTMENT, id]);
      dispatch(showToast({ message: 'Department deleted successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to delete department', type: 'error' }));
      throw error;
    },
  });
  const moveDepartment = useMutation({
    mutationFn: ({ id, parentId }) => departmentService.moveDepartment(id, parentId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENT, variables.id]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENTS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENT_TREE]);
      dispatch(showToast({ message: 'Department moved successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to move department', type: 'error' }));
      throw error;
    },
  });
  return {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    moveDepartment,
    isCreating: createDepartment.isLoading,
    isUpdating: updateDepartment.isLoading,
    isDeleting: deleteDepartment.isLoading,
    isMoving: moveDepartment.isLoading,
  };
};

export const useDepartmentRelations = (id) => {
  const children = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT, id, 'children'],
    queryFn: () => departmentService.getChildren(id),
    enabled: !!id,
  });
  const ancestors = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT, id, 'ancestors'],
    queryFn: () => departmentService.getAncestors(id),
    enabled: !!id,
  });
  const path = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT, id, 'path'],
    queryFn: () => departmentService.getPath(id),
    enabled: !!id,
  });
  const branch = useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.DEPARTMENT, id, 'branch'],
    queryFn: () => departmentService.getBranch(id),
    enabled: !!id,
  });
  return { children, ancestors, path, branch };
};