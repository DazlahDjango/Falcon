import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dashboardConfigService, widgetService, favoriteService } from '../../services/dashboard';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useDashboardConfig = (dashboardType, userId = null) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const effectiveUserId = userId || currentUser?.id;
  
  const [config, setConfig] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!dashboardType) return null;
    setLoading(true);
    try {
      const response = await dashboardConfigService.getDefaultConfig(dashboardType);
      if (response?.success) {
        setConfig(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch dashboard config', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dashboardType, dispatch]);

  const fetchWidgets = useCallback(async (configId) => {
    if (!configId) return [];
    try {
      const response = await widgetService.getWidgetsByDashboard(configId);
      if (response?.success) {
        setWidgets(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch widgets', type: 'error' }));
      return [];
    }
  }, [dispatch]);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await favoriteService.getFavorites();
      if (response?.success) {
        setFavorites(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      return [];
    }
  }, []);

  const updateConfig = useCallback(async (configData) => {
    if (!config?.id) return null;
    setSaving(true);
    try {
      const response = await dashboardConfigService.updateConfig(config.id, configData);
      if (response?.success) {
        setConfig(response.data);
        dispatch(showToast({ message: 'Dashboard configuration updated', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update config', type: 'error' }));
      return null;
    } finally {
      setSaving(false);
    }
  }, [config, dispatch]);

  const updateLayout = useCallback(async (layout) => {
    return updateConfig({ layout });
  }, [updateConfig]);

  const updateFilters = useCallback(async (filters) => {
    return updateConfig({ default_filters: filters });
  }, [updateConfig]);

  const addWidget = useCallback(async (widgetData) => {
    if (!config?.id) return null;
    setSaving(true);
    try {
      const response = await widgetService.createWidget({
        ...widgetData,
        dashboard: config.id
      });
      if (response?.success) {
        setWidgets(prev => [...prev, response.data]);
        dispatch(showToast({ message: 'Widget added successfully', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to add widget', type: 'error' }));
      return null;
    } finally {
      setSaving(false);
    }
  }, [config, dispatch]);

  const updateWidget = useCallback(async (widgetId, widgetData) => {
    setSaving(true);
    try {
      const response = await widgetService.updateWidget(widgetId, widgetData);
      if (response?.success) {
        setWidgets(prev => prev.map(w => w.id === widgetId ? response.data : w));
        dispatch(showToast({ message: 'Widget updated', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update widget', type: 'error' }));
      return null;
    } finally {
      setSaving(false);
    }
  }, [dispatch]);

  const deleteWidget = useCallback(async (widgetId) => {
    setSaving(true);
    try {
      const response = await widgetService.deleteWidget(widgetId);
      if (response?.success) {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        dispatch(showToast({ message: 'Widget removed', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to remove widget', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [dispatch]);

  const updateWidgetPositions = useCallback(async (positionUpdates) => {
    setSaving(true);
    try {
      const response = await widgetService.bulkUpdatePositions(positionUpdates);
      if (response?.success) {
        setWidgets(prev => prev.map(w => {
          const update = positionUpdates.find(u => u.id === w.id);
          if (update) {
            return { ...w, row: update.row, col: update.col };
          }
          return w;
        }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update widget positions', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [dispatch]);

  const addFavorite = useCallback(async (kpiId, kpiName, notes = '') => {
    try {
      const response = await favoriteService.addFavorite(kpiId, kpiName, notes);
      if (response?.success) {
        setFavorites(prev => [...prev, response.data]);
        dispatch(showToast({ message: 'Added to favorites', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to add favorite', type: 'error' }));
      return null;
    }
  }, [dispatch]);

  const removeFavorite = useCallback(async (favoriteId) => {
    try {
      const response = await favoriteService.removeFavorite(favoriteId);
      if (response?.success) {
        setFavorites(prev => prev.filter(f => f.id !== favoriteId));
        dispatch(showToast({ message: 'Removed from favorites', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to remove favorite', type: 'error' }));
      return false;
    }
  }, [dispatch]);

  const reorderFavorites = useCallback(async (favoriteIds) => {
    try {
      const response = await favoriteService.reorderFavorites(favoriteIds);
      if (response?.success) {
        setFavorites(prev => {
          const reordered = favoriteIds.map(id => prev.find(f => f.id === id)).filter(Boolean);
          return reordered;
        });
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to reorder favorites', type: 'error' }));
      return false;
    }
  }, [dispatch]);

  const cloneConfig = useCallback(async (newName) => {
    if (!config?.id) return null;
    setSaving(true);
    try {
      const response = await dashboardConfigService.cloneConfig(config.id, newName);
      if (response?.success) {
        dispatch(showToast({ message: 'Dashboard cloned successfully', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to clone dashboard', type: 'error' }));
      return null;
    } finally {
      setSaving(false);
    }
  }, [config, dispatch]);

  const setAsDefault = useCallback(async () => {
    if (!config?.id) return false;
    setSaving(true);
    try {
      const response = await dashboardConfigService.setDefaultConfig(config.id);
      if (response?.success) {
        dispatch(showToast({ message: 'Set as default dashboard', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to set as default', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [config, dispatch]);

  useEffect(() => {
    if (dashboardType) {
      fetchConfig();
    }
  }, [dashboardType, fetchConfig]);

  useEffect(() => {
    if (config?.id) {
      fetchWidgets(config.id);
    }
  }, [config, fetchWidgets]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    config,
    widgets,
    favorites,
    loading,
    saving,
    fetchConfig,
    fetchWidgets,
    fetchFavorites,
    updateConfig,
    updateLayout,
    updateFilters,
    addWidget,
    updateWidget,
    deleteWidget,
    updateWidgetPositions,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    cloneConfig,
    setAsDefault
  };
};