import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { costCenterService } from '../../services/structure/costCenter.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useCostCenters = (filters = {}) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.COST_CENTERS, filters],
    queryFn: () => costCenterService.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCostCenter = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.COST_CENTERS, id],
    queryFn: () => costCenterService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCostCenterByCode = (code) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.COST_CENTERS, code, 'byCode'],
    queryFn: () => costCenterService.getByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCostCenterMutations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const createCostCenter = useMutation({
    mutationFn: (data) => costCenterService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.COST_CENTERS]);
      dispatch(showToast({ message: 'Cost center created successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to create cost center', type: 'error' }));
      throw error;
    },
  });
  const updateCostCenter = useMutation({
    mutationFn: ({ id, data }) => costCenterService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.COST_CENTERS, variables.id]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.COST_CENTERS]);
      dispatch(showToast({ message: 'Cost center updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update cost center', type: 'error' }));
      throw error;
    },
  });
  const deleteCostCenter = useMutation({
    mutationFn: (id) => costCenterService.delete(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.COST_CENTERS]);
      dispatch(showToast({ message: 'Cost center deleted successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to delete cost center', type: 'error' }));
      throw error;
    },
  });
  return {
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
    isCreating: createCostCenter.isLoading,
    isUpdating: updateCostCenter.isLoading,
    isDeleting: deleteCostCenter.isLoading,
  };
};

export const useCostCenterTree = (includeInactive = false) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.COST_CENTERS, 'tree', { includeInactive }],
    queryFn: () => costCenterService.getTree(includeInactive),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBudgetUtilization = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.COST_CENTERS, id, 'budget'],
    queryFn: () => costCenterService.getBudgetUtilization(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
};