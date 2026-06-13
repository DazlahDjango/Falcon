// src/hooks/reviews/useAnalyticsDashboard.js
// Hook for managing analytics dashboard widgets

import { useState, useCallback, useEffect } from 'react';
import { analyticsDashboardService } from '../../services/reviews';
import { WIDGET_SIZES, WIDGET_TYPES } from '../../config/constants/reviewConstants';

export const useAnalyticsDashboard = (options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [widgetData, setWidgetData] = useState({});
    const [refreshing, setRefreshing] = useState({});

    /**
     * Fetch user's dashboard widgets
     */
    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsDashboardService.getUserAnalyticsDashboard();
            const widgetsList = data.results || data;
            setWidgets(widgetsList);
            
            // Fetch data for each widget
            for (const widget of widgetsList) {
                if (widget.is_visible) {
                    await fetchWidgetData(widget.id);
                }
            }
            
            return widgetsList;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch data for a specific widget
     */
    const fetchWidgetData = useCallback(async (widgetId, params = {}) => {
        try {
            const data = await analyticsDashboardService.getWidgetData(widgetId, params);
            setWidgetData(prev => ({ ...prev, [widgetId]: data }));
            return data;
        } catch (err) {
            console.error(`Failed to fetch widget ${widgetId} data:`, err);
            return null;
        }
    }, []);

    /**
     * Refresh a specific widget's data
     */
    const refreshWidget = useCallback(async (widgetId) => {
        setRefreshing(prev => ({ ...prev, [widgetId]: true }));
        try {
            const data = await analyticsDashboardService.refreshWidget(widgetId);
            setWidgetData(prev => ({ ...prev, [widgetId]: data }));
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setRefreshing(prev => ({ ...prev, [widgetId]: false }));
        }
    }, []);

    /**
     * Refresh all widgets
     */
    const refreshAllWidgets = useCallback(async () => {
        const refreshPromises = widgets.map(widget => refreshWidget(widget.id));
        await Promise.all(refreshPromises);
    }, [widgets, refreshWidget]);

    /**
     * Add a new widget to dashboard
     */
    const addWidget = useCallback(async (widgetData) => {
        setLoading(true);
        try {
            const newWidget = await analyticsDashboardService.create({
                widget_type: widgetData.type,
                title: widgetData.title,
                size: widgetData.size || WIDGET_SIZES.MEDIUM,
                config: widgetData.config || {},
                order: widgets.length
            });
            setWidgets(prev => [...prev, newWidget]);
            await fetchWidgetData(newWidget.id);
            return newWidget;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [widgets, fetchWidgetData]);

    /**
     * Update widget configuration
     */
    const updateWidget = useCallback(async (widgetId, updates) => {
        setLoading(true);
        try {
            const updated = await analyticsDashboardService.update(widgetId, updates);
            setWidgets(prev => prev.map(w => w.id === widgetId ? updated : w));
            await refreshWidget(widgetId);
            return updated;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [refreshWidget]);

    /**
     * Remove widget from dashboard
     */
    const removeWidget = useCallback(async (widgetId) => {
        setLoading(true);
        try {
            await analyticsDashboardService.delete(widgetId);
            setWidgets(prev => prev.filter(w => w.id !== widgetId));
            setWidgetData(prev => {
                const newData = { ...prev };
                delete newData[widgetId];
                return newData;
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reorder widgets
     */
    const reorderWidgets = useCallback(async (newOrder) => {
        const widgetsOrder = newOrder.map((widgetId, index) => ({
            id: widgetId,
            order: index
        }));
        
        try {
            await analyticsDashboardService.reorderWidgets(widgetsOrder);
            setWidgets(prev => {
                const ordered = [...prev];
                ordered.sort((a, b) => {
                    return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
                });
                return ordered;
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    }, []);

    /**
     * Reset dashboard to default
     */
    const resetDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const defaultWidgets = await analyticsDashboardService.resetAnalyticsDashboard();
            setWidgets(defaultWidgets.results || defaultWidgets);
            // Clear old widget data
            setWidgetData({});
            // Fetch data for new widgets
            for (const widget of defaultWidgets) {
                await fetchWidgetData(widget.id);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchWidgetData]);

    // Auto-fetch dashboard on mount
    useEffect(() => {
        fetchDashboard();
    }, []);

    return {
        loading,
        error,
        widgets,
        widgetData,
        refreshing,
        fetchDashboard,
        fetchWidgetData,
        refreshWidget,
        refreshAllWidgets,
        addWidget,
        updateWidget,
        removeWidget,
        reorderWidgets,
        resetDashboard
    };
};

export default useAnalyticsDashboard;