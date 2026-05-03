import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportingService } from '../../services/structure/reporting.service';
import { normalizeStructureListPage, normalizeStructureEntity } from '../../services/structure/structureResponse';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useReportingLine = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_LINES, id],
    queryFn: () => reportingService.getById(id),
    select: normalizeStructureEntity,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useReportingLines = (filters = {}, page = 1, pageSize = 50) => {
  const params = { page, page_size: pageSize, ...filters };

  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_LINES, params],
    queryFn: () => reportingService.list(params),
    select: normalizeStructureListPage,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useReportingLineMutations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const createReportingLine = useMutation({
    mutationFn: (data) => reportingService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_LINES]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_CHAIN]);
      dispatch(showToast({ message: 'Reporting line created successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to create reporting line', type: 'error' }));
      throw error;
    },
  });
  const updateReportingLine = useMutation({
    mutationFn: ({ id, data }) => reportingService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_LINES, variables.id]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_CHAIN]);
      dispatch(showToast({ message: 'Reporting line updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update reporting line', type: 'error' }));
      throw error;
    },
  });
  const deleteReportingLine = useMutation({
    mutationFn: (id) => reportingService.delete(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_LINES]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_CHAIN]);
      dispatch(showToast({ message: 'Reporting line deleted successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to delete reporting line', type: 'error' }));
      throw error;
    },
  });
  const assignMatrixReporting = useMutation({
    mutationFn: (data) => reportingService.assignMatrixReporting(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_LINES]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_CHAIN]);
      dispatch(showToast({ message: 'Matrix reporting assigned successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to assign matrix reporting', type: 'error' }));
      throw error;
    },
  });
  const assignInterimManager = useMutation({
    mutationFn: (data) => reportingService.assignInterimManager(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_LINES]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_CHAIN]);
      dispatch(showToast({ message: 'Interim manager assigned successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to assign interim manager', type: 'error' }));
      throw error;
    },
  });
  const updateReportingWeights = useMutation({
    mutationFn: ({ employeeUserId, weights }) => reportingService.updateReportingWeights(employeeUserId, weights),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_LINES]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_CHAIN]);
      dispatch(showToast({ message: 'Reporting weights updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update reporting weights', type: 'error' }));
      throw error;
    },
  });
  return {
    createReportingLine,
    updateReportingLine,
    deleteReportingLine,
    assignMatrixReporting,
    assignInterimManager,
    updateReportingWeights,
    isCreating: createReportingLine.isLoading,
    isUpdating: updateReportingLine.isLoading,
    isDeleting: deleteReportingLine.isLoading,
    isAssigningMatrix: assignMatrixReporting.isLoading,
    isAssigningInterim: assignInterimManager.isLoading,
    isUpdatingWeights: updateReportingWeights.isLoading,
  };
};

export const useReportingLinesByEmployee = (userId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_LINES, 'employee', userId],
    queryFn: () => reportingService.getByEmployee(userId),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });
};

export const useReportingLinesByManager = (userId) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.REPORTING_LINES, 'manager', userId],
    queryFn: () => reportingService.getByManager(userId),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });
};