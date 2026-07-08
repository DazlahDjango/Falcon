import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { bulkService } from '../../services/structure/bulk.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useBulkOperations = () => {
  const dispatch = useDispatch();

  const bulkDepartments = useCallback(async (data) => {
    try {
      const response = await bulkService.processDepartments(data.departments, data.action);
      if (response.data?.results?.failed_count === 0) {
        dispatch(showToast({
          message: `Successfully processed ${response.data?.results?.total || 0} departments`,
          type: 'success',
        }));
      } else {
        dispatch(showToast({
          message: `Processed ${response.data?.results?.total || 0} departments with ${response.data?.results?.failed_count || 0} failures`,
          type: 'warning',
        }));
      }
      return response;
    } catch (error) {
      dispatch(showToast({
        message: error.message || 'Bulk department operation failed',
        type: 'error',
      }));
      throw error;
    }
  }, [dispatch]);

  const bulkEmployments = useCallback(async (data) => {
    try {
      const response = await bulkService.processEmployments(data.employments);
      if (response.data?.error_count === 0) {
        dispatch(showToast({
          message: `Successfully created ${response.data?.success_count || 0} employments`,
          type: 'success',
        }));
      } else {
        dispatch(showToast({
          message: `Created ${response.data?.success_count || 0} employments with ${response.data?.error_count || 0} failures`,
          type: 'warning',
        }));
      }
      return response;
    } catch (error) {
      dispatch(showToast({
        message: error.message || 'Bulk employment operation failed',
        type: 'error',
      }));
      throw error;
    }
  }, [dispatch]);

  const bulkReportingLines = useCallback(async (data) => {
    try {
      const response = await bulkService.processReportingLines(data.reporting_lines, data.action);
      if (response.data?.results?.failed_count === 0) {
        dispatch(showToast({
          message: `Successfully processed ${response.data?.results?.total || 0} reporting lines`,
          type: 'success',
        }));
      } else {
        dispatch(showToast({
          message: `Processed ${response.data?.results?.total || 0} reporting lines with ${response.data?.results?.failed_count || 0} failures`,
          type: 'warning',
        }));
      }
      return response;
    } catch (error) {
      dispatch(showToast({
        message: error.message || 'Bulk reporting line operation failed',
        type: 'error',
      }));
      throw error;
    }
  }, [dispatch]);

  const reassignManager = useCallback(async (employeeIds, newManagerId, effectiveDate) => {
    try {
      const response = await bulkService.reassignManager(employeeIds, newManagerId, effectiveDate);
      if (response.data?.failed_count === 0) {
        dispatch(showToast({
          message: `Successfully reassigned ${response.data?.updated_count || 0} employees`,
          type: 'success',
        }));
      } else {
        dispatch(showToast({
          message: `Reassigned ${response.data?.updated_count || 0} employees with ${response.data?.failed_count || 0} failures`,
          type: 'warning',
        }));
      }
      return response;
    } catch (error) {
      dispatch(showToast({
        message: error.message || 'Bulk reassignment failed',
        type: 'error',
      }));
      throw error;
    }
  }, [dispatch]);

  const bulkTransfer = useCallback(async (employeeIds, newDepartmentId, newUnitId, effectiveDate) => {
    try {
      const response = await bulkService.bulkTransfer(employeeIds, newDepartmentId, newUnitId, effectiveDate);
      if (response.data?.failed_count === 0) {
        dispatch(showToast({
          message: `Successfully transferred ${response.data?.updated_count || 0} employees`,
          type: 'success',
        }));
      } else {
        dispatch(showToast({
          message: `Transferred ${response.data?.updated_count || 0} employees with ${response.data?.failed_count || 0} failures`,
          type: 'warning',
        }));
      }
      return response;
    } catch (error) {
      dispatch(showToast({
        message: error.message || 'Bulk transfer failed',
        type: 'error',
      }));
      throw error;
    }
  }, [dispatch]);

  return {
    bulkDepartments,
    bulkEmployments,
    bulkReportingLines,
    reassignManager,
    bulkTransfer,
    isCreating: false,
  };
};

export default useBulkOperations;