import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employmentService } from '../../services/structure/employment.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useEmployment = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.EMPLOYMENT, id],
    queryFn: () => employmentService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmploymentMutations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const createEmployment = useMutation({
    mutationFn: (data) => employmentService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENTS]);
      dispatch(showToast({ message: 'Employment created successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to create employment', type: 'error' }));
      throw error;
    },
  });
  const updateEmployment = useMutation({
    mutationFn: ({ id, data }) => employmentService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENT, variables.id]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENTS]);
      dispatch(showToast({ message: 'Employment updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update employment', type: 'error' }));
      throw error;
    },
  });
  const deleteEmployment = useMutation({
    mutationFn: (id) => employmentService.delete(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENTS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.CURRENT_EMPLOYMENT]);
      queryClient.removeQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENT, id]);
      dispatch(showToast({ message: 'Employment deleted successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to delete employment', type: 'error' }));
      throw error;
    },
  });
  const transferEmployment = useMutation({
    mutationFn: (data) => employmentService.transferEmployee(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENTS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.CURRENT_EMPLOYMENT]);
      dispatch(showToast({ message: 'Employee transferred successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to transfer employee', type: 'error' }));
      throw error;
    },
  });
  const endEmployment = useMutation({
    mutationFn: ({ userId, endDate, reason }) => employmentService.endEmployment(userId, endDate, reason),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENTS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.CURRENT_EMPLOYMENT]);
      dispatch(showToast({ message: 'Employment ended successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to end employment', type: 'error' }));
      throw error;
    },
  });
  return {
    createEmployment,
    updateEmployment,
    deleteEmployment,
    transferEmployment,
    endEmployment,
    isCreating: createEmployment.isLoading,
    isUpdating: updateEmployment.isLoading,
    isDeleting: deleteEmployment.isLoading,
    isTransferring: transferEmployment.isLoading,
    isEnding: endEmployment.isLoading,
  };
};