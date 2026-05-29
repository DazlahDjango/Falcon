// frontend/src/hooks/dashboard/useStaffDashboard.js

import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { staffService } from '../../services/dashboard/staff.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useStaffDashboard = (options = {}) => {
  const { autoFetch = true, period: initialPeriod = 'current' } = options;
  const dispatch = useDispatch();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [myKPIs, setMyKPIs] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [missionStatus, setMissionStatus] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [period, setPeriod] = useState(initialPeriod);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingMission, setUpdatingMission] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await staffService.getDashboardData({ period });
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
  }, [period, dispatch]);

  const fetchMyKPIs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await staffService.getMyKPIs(period);
      if (response?.success) {
        setMyKPIs(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch KPIs', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [period, dispatch]);

  const fetchPendingSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await staffService.getPendingSubmissions();
      if (response?.success) {
        setPendingSubmissions(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch pending submissions', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchMissionStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await staffService.getMissionStatus(period);
      if (response?.success) {
        setMissionStatus(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch mission status', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [period, dispatch]);

  const fetchPendingTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await staffService.getPendingTasks();
      if (response?.success) {
        setPendingTasks(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch tasks', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const submitKPI = useCallback(async (kpiId, value, comments = '') => {
    setSubmitting(true);
    try {
      const response = await staffService.submitKPI({ kpiId, value, comments });
      if (response?.success) {
        dispatch(showToast({ message: 'KPI data submitted for approval', type: 'success' }));
        await fetchMyKPIs();
        await fetchPendingSubmissions();
        await fetchDashboardData();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to submit KPI', type: 'error' }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [dispatch, fetchMyKPIs, fetchPendingSubmissions, fetchDashboardData]);

  const updateMissionStatus = useCallback(async (data) => {
    setUpdatingMission(true);
    try {
      const response = await staffService.updateMissionStatus(data);
      if (response?.success) {
        dispatch(showToast({ message: 'Mission status updated', type: 'success' }));
        await fetchMissionStatus();
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update mission status', type: 'error' }));
      return false;
    } finally {
      setUpdatingMission(false);
    }
  }, [dispatch, fetchMissionStatus]);

  const exportDashboard = useCallback(async (format = 'pdf') => {
    setExporting(true);
    try {
      const response = await staffService.exportDashboard({ period, format });
      if (response?.success || response?.data) {
        const blob = response.data || response;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `staff_dashboard_${period}.${format}`);
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
  }, [period, dispatch]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchMyKPIs(),
      fetchPendingSubmissions(),
      fetchMissionStatus(),
      fetchPendingTasks(),
    ]);
  }, [fetchDashboardData, fetchMyKPIs, fetchPendingSubmissions, fetchMissionStatus, fetchPendingTasks]);

  useEffect(() => {
    if (autoFetch) {
      refreshAll();
    }
  }, [autoFetch, refreshAll]);

  // Re-fetch when period changes
  useEffect(() => {
    if (autoFetch) {
      fetchDashboardData();
      fetchMyKPIs();
      fetchMissionStatus();
    }
  }, [period, autoFetch, fetchDashboardData, fetchMyKPIs, fetchMissionStatus]);

  return {
    dashboardData,
    myKPIs,
    pendingSubmissions,
    missionStatus,
    pendingTasks,
    period,
    loading,
    submitting,
    updatingMission,
    exporting,
    setPeriod,
    fetchDashboardData,
    fetchMyKPIs,
    fetchPendingSubmissions,
    fetchMissionStatus,
    fetchPendingTasks,
    submitKPI,
    updateMissionStatus,
    exportDashboard,
    refreshAll,
    refreshDashboard: refreshAll,
    loadMyKPIs: fetchMyKPIs,
    loadMissionStatus: fetchMissionStatus,
    loadPendingTasks: fetchPendingTasks,
  };
};