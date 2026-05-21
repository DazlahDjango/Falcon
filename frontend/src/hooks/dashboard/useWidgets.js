// frontend/src/hooks/dashboard/useWidgets.js

import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { widgetService } from '../../services/dashboard/widget.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useWidgets = (dashboardId = null, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [widgetData, setWidgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchWidgets = useCallback(async () => {
    if (!dashboardId) return [];
    setLoading(true);
    try {
      const response = await widgetService.getByDashboard(dashboardId);
      if (response?.success) {
        setWidgets(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch widgets', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dashboardId, dispatch]);

  const fetchWidgetData = useCallback(async (widgetId, filters = {}) => {
    if (!widgetId) return null;
    setLoading(true);
    try {
      const response = await widgetService.getWidgetData(widgetId, filters);
      if (response?.success) {
        setWidgetData(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch widget data', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createWidget = useCallback(async (widgetData) => {
    if (!dashboardId) return null;
    setSaving(true);
    try {
      const response = await widgetService.create({ ...widgetData, dashboard: dashboardId });
      if (response?.success) {
        setWidgets(prev => [...prev, response.data]);
        dispatch(showToast({ message: 'Widget created successfully', type: 'success' }));
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to create widget', type: 'error' }));
      return null;
    } finally {
      setSaving(false);
    }
  }, [dashboardId, dispatch]);

  const updateWidget = useCallback(async (widgetId, widgetData) => {
    if (!widgetId) return null;
    setSaving(true);
    try {
      const response = await widgetService.update(widgetId, widgetData);
      if (response?.success) {
        setWidgets(prev => prev.map(w => w.id === widgetId ? response.data : w));
        dispatch(showToast({ message: 'Widget updated successfully', type: 'success' }));
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
    if (!widgetId) return false;
    setSaving(true);
    try {
      const response = await widgetService.delete(widgetId);
      if (response?.success) {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        dispatch(showToast({ message: 'Widget deleted successfully', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to delete widget', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [dispatch]);

  const updateWidgetPositions = useCallback(async (positions) => {
    setSaving(true);
    try {
      const response = await widgetService.bulkUpdatePositions(positions);
      if (response?.success) {
        setWidgets(prev => prev.map(w => {
          const newPos = positions.find(p => p.id === w.id);
          if (newPos) {
            return { ...w, row: newPos.row, col: newPos.col };
          }
          return w;
        }));
        dispatch(showToast({ message: 'Widget positions updated', type: 'success' }));
        return true;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to update widget positions', type: 'error' }));
      return false;
    } finally {
      setSaving(false);
    }
  }, [dispatch]);

  const duplicateWidget = useCallback(async (widgetId) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return null;
    
    const { id, ...widgetWithoutId } = widget;
    return createWidget({
      ...widgetWithoutId,
      title: `${widget.title} (Copy)`,
      row: (widget.row || 0) + 1,
    });
  }, [widgets, createWidget]);

  const refreshWidgets = useCallback(async () => {
    return fetchWidgets();
  }, [fetchWidgets]);

  useEffect(() => {
    if (autoFetch && dashboardId) {
      fetchWidgets();
    }
  }, [autoFetch, dashboardId, fetchWidgets]);

  return {
    widgets,
    selectedWidget,
    widgetData,
    loading,
    saving,
    setSelectedWidget,
    fetchWidgets,
    fetchWidgetData,
    createWidget,
    updateWidget,
    deleteWidget,
    updateWidgetPositions,
    duplicateWidget,
    refreshWidgets,
  };
};