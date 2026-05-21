import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dashboardWebSocket } from '../../services/dashboard';
import { showAlert } from '../../store/accounts/slice/uiSlice';
import { store as appStore } from '../../store';

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
    appStore.dispatch(showAlert({ type: 'error', message: err.message || 'Dashboard error occurred' }));
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
          appStore.dispatch(showAlert({ type: 'warning', message: message.message }));
        }
        
        if (options.onWebsocketMessage) {
          options.onWebsocketMessage(message);
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
  const { getDashboardService } = await import('../../services/dashboard');
  const service = getDashboardService(dashboardType);
  if (!service) {
    throw new Error(`Unknown dashboard type: ${dashboardType}`);
  }
  return service.getDashboardData();
};