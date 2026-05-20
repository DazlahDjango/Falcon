import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dashboardWebSocket } from '../../services/dashboard';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useDashboard = (dashboardType, options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 60000,
    enableWebSocket = true,
    onDataUpdate = null,
    onError = null
  } = options;

  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const handleError = useCallback((err) => {
    if (!isMountedRef.current) return;
    setError(err);
    setLoading(false);
    if (onError) onError(err);
    dispatch(showToast({ message: err.message || 'Dashboard error occurred', type: 'error' }));
  }, [dispatch, onError]);

  const handleDataUpdate = useCallback((newData) => {
    if (!isMountedRef.current) return;
    setData(newData);
    setLastUpdated(new Date());
    setLoading(false);
    setError(null);
    if (onDataUpdate) onDataUpdate(newData);
  }, [onDataUpdate]);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return null;
    setIsRefreshing(true);
    try {
      const response = await fetchDashboardData(dashboardType);
      if (response?.success) {
        handleDataUpdate(response.data);
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [dashboardType, handleDataUpdate, handleError]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(fetchData, refreshInterval);
    }

    let ws = null;
    if (enableWebSocket && dashboardWebSocket) {
      const handleWebSocketMessage = (message) => {
        if (message.type === 'update' || message.type === 'initial') {
          handleDataUpdate(message.data);
        } else if (message.type === 'alert') {
          dispatch(showToast({ message: message.message, type: 'warning' }));
        }
      };
      dashboardWebSocket.connect(dashboardType, handleWebSocketMessage, handleError);
      ws = dashboardWebSocket;
    }

    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (ws) {
        ws.disconnect();
      }
    };
  }, [dashboardType, autoRefresh, refreshInterval, enableWebSocket, fetchData, handleDataUpdate, handleError, dispatch]);

  const refresh = useCallback(async () => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isRefreshing,
    refresh
  };
};

const fetchDashboardData = async (dashboardType) => {
  switch (dashboardType) {
    case 'executive':
      const { executiveDashboardService } = await import('../../services/dashboard/executive.service');
      return executiveDashboardService.getDashboardData();
    case 'client_admin':
      const { clientAdminDashboardService } = await import('../../services/dashboard/clientAdmin.service');
      return clientAdminDashboardService.getDashboardData();
    case 'super_admin':
      const { superAdminDashboardService } = await import('../../services/dashboard/superAdmin.service');
      return superAdminDashboardService.getDashboardData();
    default:
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
  }
};