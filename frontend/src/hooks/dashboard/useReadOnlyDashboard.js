// frontend/src/hooks/dashboard/useReadOnlyDashboard.js

import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { readOnlyService } from '../../services/dashboard/readOnly.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useReadOnlyDashboard = (options = {}) => {
  const { autoFetch = true, period: initialPeriod = 'current', viewType: initialViewType = 'executive' } = options;
  const dispatch = useDispatch();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [period, setPeriod] = useState(initialPeriod);
  const [viewType, setViewType] = useState(initialViewType);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await readOnlyService.getDashboardData({ period, viewType });
      if (response?.success) {
        setDashboardData(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch dashboard data', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [period, viewType, dispatch]);

  const fetchExecutiveView = useCallback(async () => {
    setViewType('executive');
    return fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchManagerView = useCallback(async () => {
    setViewType('manager');
    return fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchStaffView = useCallback(async () => {
    setViewType('staff');
    return fetchDashboardData();
  }, [fetchDashboardData]);

  const exportDashboard = useCallback(async (format = 'pdf') => {
    setExporting(true);
    try {
      const response = await readOnlyService.exportDashboard({ period, viewType, format });
      if (response?.success || response?.data) {
        const blob = response.data || response;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${viewType}_dashboard_${period}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        dispatch(showToast({ message: 'Export completed', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to export dashboard', type: 'error' }));
      return false;
    } finally {
      setExporting(false);
    }
  }, [period, viewType, dispatch]);

  const refreshDashboard = useCallback(async () => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (autoFetch) {
      fetchDashboardData();
    }
  }, [autoFetch, fetchDashboardData]);

  // Re-fetch when period or viewType changes
  useEffect(() => {
    if (autoFetch) {
      fetchDashboardData();
    }
  }, [period, viewType, autoFetch, fetchDashboardData]);

  return {
    dashboardData,
    period,
    viewType,
    loading,
    exporting,
    setPeriod,
    setViewType,
    fetchDashboardData,
    fetchExecutiveView,
    fetchManagerView,
    fetchStaffView,
    exportDashboard,
    refreshDashboard,
    // Read-only flags
    isReadOnly: true,
    canEdit: false,
    canSubmit: false,
    canApprove: false,
    canConfigure: false,
  };
};