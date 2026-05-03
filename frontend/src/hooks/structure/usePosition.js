import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { positionService } from '../../services/structure/position.service';
import { normalizeStructureEntity } from '../../services/structure/structureResponse';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const usePosition = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.POSITION, id],
    queryFn: () => positionService.getById(id),
    select: normalizeStructureEntity,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePositionByCode = (jobCode) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.POSITION, jobCode, 'byCode'],
    queryFn: () => positionService.getByCode(jobCode),
    select: normalizeStructureEntity,
    enabled: !!jobCode,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePositionMutations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const createPosition = useMutation({
    mutationFn: (data) => positionService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.POSITIONS]);
      dispatch(showToast({ message: 'Position created successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to create position', type: 'error' }));
      throw error;
    },
  });
  const updatePosition = useMutation({
    mutationFn: ({ id, data }) => positionService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.POSITION, variables.id]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.POSITIONS]);
      dispatch(showToast({ message: 'Position updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update position', type: 'error' }));
      throw error;
    },
  });
  const deletePosition = useMutation({
    mutationFn: (id) => positionService.delete(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.POSITIONS]);
      queryClient.removeQueries([STRUCTURE_QUERY_KEYS.POSITION, id]);
      dispatch(showToast({ message: 'Position deleted successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to delete position', type: 'error' }));
      throw error;
    },
  });
  return {
    createPosition,
    updatePosition,
    deletePosition,
    isCreating: createPosition.isLoading,
    isUpdating: updatePosition.isLoading,
    isDeleting: deletePosition.isLoading,
  };
};

export const usePositionIncumbents = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.POSITION, id, 'incumbents'],
    queryFn: () => positionService.getIncumbents(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
};

export const usePositionReportingChain = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.POSITION, id, 'reportingChain'],
    queryFn: () => positionService.getReportingChain(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};