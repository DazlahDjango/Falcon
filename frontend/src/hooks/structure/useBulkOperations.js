import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkService } from '../../services/structure/bulk.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

export const useBulkDepartmentOperations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [progress, setProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const bulkCreate = useMutation({
    mutationFn: (departments) => bulkService.processDepartments(departments, 'create'),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENTS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENT_TREE]);
      dispatch(showToast({
        message: `${response.data?.results?.created_count || 0} departments created, ${response.data?.results?.failed_count || 0} failed`,
        type: response.data?.results?.failed_count > 0 ? 'warning' : 'success',
      }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Bulk create failed', type: 'error' }));
      throw error;
    },
  });
  const bulkUpdate = useMutation({
    mutationFn: (departments) => bulkService.processDepartments(departments, 'update'),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENTS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.DEPARTMENT_TREE]);
      dispatch(showToast({
        message: `${response.data?.results?.updated_count || 0} departments updated, ${response.data?.results?.failed_count || 0} failed`,
        type: response.data?.results?.failed_count > 0 ? 'warning' : 'success',
      }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Bulk update failed', type: 'error' }));
      throw error;
    },
  });
  return {
    bulkCreate,
    bulkUpdate,
    isCreating: bulkCreate.isLoading,
    isUpdating: bulkUpdate.isLoading,
    progress,
  };
};

export const useBulkEmploymentOperations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const bulkCreate = useMutation({
    mutationFn: (employments) => bulkService.processEmployments(employments),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENTS]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.CURRENT_EMPLOYMENT]);
      dispatch(showToast({
        message: `${response.data?.success_count || 0} employments created, ${response.data?.error_count || 0} failed`,
        type: response.data?.error_count > 0 ? 'warning' : 'success',
      }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Bulk create failed', type: 'error' }));
      throw error;
    },
  });
  const bulkReassignManager = useMutation({
    mutationFn: ({ employeeIds, newManagerId, effectiveDate }) => bulkService.reassignManager(employeeIds, newManagerId, effectiveDate),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_LINES]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_CHAIN]);
      dispatch(showToast({
        message: `${response.data?.updated_count || 0} employees reassigned, ${response.data?.failed_count || 0} failed`,
        type: response.data?.failed_count > 0 ? 'warning' : 'success',
      }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Bulk reassign failed', type: 'error' }));
      throw error;
    },
  });
  const bulkTransfer = useMutation({
    mutationFn: ({ employeeIds, newDepartmentId, newTeamId, effectiveDate }) => bulkService.bulkTransfer(employeeIds, newDepartmentId, newTeamId, effectiveDate),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.EMPLOYMENTS]);
      dispatch(showToast({
        message: `${response.data?.updated_count || 0} employees transferred, ${response.data?.failed_count || 0} failed`,
        type: response.data?.failed_count > 0 ? 'warning' : 'success',
      }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Bulk transfer failed', type: 'error' }));
      throw error;
    },
  });
  return {
    bulkCreate,
    bulkReassignManager,
    bulkTransfer,
    isCreating: bulkCreate.isLoading,
    isReassigning: bulkReassignManager.isLoading,
    isTransferring: bulkTransfer.isLoading,
  };
};

export const useBulkReportingOperations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const bulkCreate = useMutation({
    mutationFn: (reportingLines) => bulkService.processReportingLines(reportingLines, 'create'),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_LINES]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.REPORTING_CHAIN]);
      dispatch(showToast({
        message: `${response.data?.created_count || 0} reporting lines created, ${response.data?.failed_count || 0} failed`,
        type: response.data?.failed_count > 0 ? 'warning' : 'success',
      }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Bulk create failed', type: 'error' }));
      throw error;
    },
  });
  return {
    bulkCreate,
    isCreating: bulkCreate.isLoading,
  };
};