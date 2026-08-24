import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { executiveDashboardService } from '../../services/dashboard/executive.service';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDashboard } from './useDashboard';

export const useExecutiveDashboard = (options = {}) => {
  const { refreshInterval = 10000, autoFetch = true } = options;
  const dispatch = useDispatch();
  const [departments, setDepartments] = useState([]);
  const [trends, setTrends] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentLoading, setDepartmentLoading] = useState(false);

  const refreshAllRef = useRef(null);

  const onWebsocketMessage = useCallback((message) => {
    if (message.type === 'kpi_update' || message.type === 'dashboard_update' || message.type === 'update' || message.type?.endsWith('_update')) {
      if (refreshAllRef.current) {
        refreshAllRef.current().catch(console.error);
      }
    }
  }, []);

  const {
    data: dashboardData,
    loading,
    error,
    refresh: refreshDashboard
  } = useDashboard('executive', { ...options, onWebsocketMessage });

  const fetchDepartments = useCallback(async () => {
    setDepartmentLoading(true);
    try {
      const response = await executiveDashboardService.getDepartments();
      if (response?.success) {
        setDepartments(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch departments', type: 'error' }));
      return [];
    } finally {
      setDepartmentLoading(false);
    }
  }, [dispatch]);

  const fetchDepartmentDetails = useCallback(async (departmentId) => {
    if (!departmentId) return null;
    setDepartmentLoading(true);
    try {
      const response = await executiveDashboardService.getDepartmentDetails(departmentId);
      if (response?.success) {
        setSelectedDepartment(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch department details', type: 'error' }));
      return null;
    } finally {
      setDepartmentLoading(false);
    }
  }, [dispatch]);

  const fetchTrends = useCallback(async () => {
    try {
      const response = await executiveDashboardService.getTrends();
      if (response?.success) {
        setTrends(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch trends', type: 'error' }));
      return [];
    }
  }, [dispatch]);

  const fetchIssues = useCallback(async () => {
    try {
      const response = await executiveDashboardService.getTopIssues();
      if (response?.success) {
        setIssues(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch issues', type: 'error' }));
      return [];
    }
  }, [dispatch]);

  const fetchKpiTrends = useCallback(async (kpiId, period = 'monthly') => {
    if (!kpiId) return null;
    try {
      const response = await executiveDashboardService.getKpiTrends(kpiId, period);
      if (response?.success) {
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch KPI trends', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const refreshAll = useCallback(async () => {
    await refreshDashboard();
    await Promise.all([
      fetchDepartments(),
      fetchTrends(),
      fetchIssues()
    ]);
  }, [refreshDashboard, fetchDepartments, fetchTrends, fetchIssues]);

  useEffect(() => {
    refreshAllRef.current = refreshAll;
    if (autoFetch) {
      refreshAll().catch(() => {});

      if (refreshInterval > 0) {
        const timer = setInterval(() => {
          if (refreshAllRef.current) {
            refreshAllRef.current().catch(() => {});
          }
        }, refreshInterval);
        return () => clearInterval(timer);
      }
    }
  }, [autoFetch, refreshAll, refreshInterval]);

  return {
    dashboardData,
    departments,
    trends,
    issues,
    selectedDepartment,
    loading,
    departmentLoading,
    error,
    fetchDepartments,
    fetchDepartmentDetails,
    fetchTrends,
    fetchIssues,
    fetchKpiTrends,
    setSelectedDepartment,
    refreshDashboard,
    refreshAll,
    // Aliases for backward compatibility
    fetchDepartmentsData: fetchDepartments,
    fetchTrendsData: fetchTrends,
    fetchIssuesData: fetchIssues,
  };
};