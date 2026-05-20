import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { dashboardAlertService } from '../../services/dashboard/alert.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useDashboardAlerts = (options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suppressing, setSuppressing] = useState(false);

  const fetchAlerts = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await dashboardAlertService.getAlerts(filters);
      if (response?.success) {
        setAlerts(response.data.results || response.data);
        setTotal(response.data.count || response.data.length || 0);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch alerts', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createAlert = useCallback(async (alertData) => {
    setLoading(true);
    try {
      const response = await dashboardAlertService.createAlert(alertData);
      if (response?.success) {
        setAlerts(prev => [response.data, ...prev]);
        setTotal(prev => prev + 1);
        dispatch(showToast({ message: 'Alert created successfully', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to create alert', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateAlert = useCallback(async (alertId, alertData) => {
    setLoading(true);
    try {
      const response = await dashboardAlertService.updateAlert(alertId, alertData);
      if (response?.success) {
        setAlerts(prev => prev.map(a => a.id === alertId ? response.data : a));
        dispatch(showToast({ message: 'Alert updated', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update alert', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteAlert = useCallback(async (alertId) => {
    setLoading(true);
    try {
      const response = await dashboardAlertService.deleteAlert(alertId);
      if (response?.success) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        setTotal(prev => prev - 1);
        dispatch(showToast({ message: 'Alert deleted', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to delete alert', type: 'error' }));
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const suppressAlert = useCallback(async (alertId, durationMinutes = 60) => {
    setSuppressing(true);
    try {
      const response = await dashboardAlertService.suppressAlert(alertId, durationMinutes);
      if (response?.success) {
        setAlerts(prev => prev.map(a => a.id === alertId ? response.data : a));
        dispatch(showToast({ message: `Alert suppressed for ${durationMinutes} minutes`, type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to suppress alert', type: 'error' }));
      return false;
    } finally {
      setSuppressing(false);
    }
  }, [dispatch]);

  const triggerAlert = useCallback(async (alertId) => {
    setLoading(true);
    try {
      const response = await dashboardAlertService.triggerAlert(alertId);
      if (response?.success) {
        dispatch(showToast({ message: 'Alert triggered', type: 'info' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to trigger alert', type: 'error' }));
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch) {
      fetchAlerts();
    }
  }, [autoFetch, fetchAlerts]);

  return {
    alerts,
    total,
    loading,
    suppressing,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    suppressAlert,
    triggerAlert
  };
};