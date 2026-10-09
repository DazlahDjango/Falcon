// ============================================
// frontend/src/hooks/reports/useWidgets.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWidgets,
    fetchWidget,
    createWidget,
    updateWidget,
    deleteWidget,
    fetchWidgetData,
    performWidgetAction,
    refreshWidget,
    fetchWidgetTypes,
    fetchWidgetsByDashboard,
    clearCurrentWidget,
    clearWidgetErrors,
    setWidgetFilters,
    resetWidgetFilters,
    setWidgetPagination,
    clearAllWidgets,
    clearWidgetData,
} from '../../store/reports/slice/widget.slice';
import {
    selectWidgets,
    selectCurrentWidget,
    selectWidgetData,
    selectWidgetLoading,
    selectWidgetDetailsLoading,
    selectWidgetSubmitting,
    selectWidgetError,
    selectWidgetPagination,
    selectWidgetPage,
    selectWidgetPageSize,
    selectWidgetTotal,
    selectWidgetTotalPages,
    selectWidgetFilters,
    selectWidgetById,
    selectWidgetsByType,
    selectActiveWidgets,
    selectVisibleWidgets,
    selectWidgetsByDashboard,
    selectWidgetCount,
    selectHasWidgets,
    selectIsWidgetLoading,
    selectHasWidgetError,
    selectWidgetTypes,
} from '../../store/reports/selectors/widget.selectors';

// Standalone Selector Hooks (Top-Level Component Use)
export const useWidgetById = (id) => useSelector((state) => selectWidgetById(state, id));
export const useWidgetsByType = (type) => useSelector((state) => selectWidgetsByType(state, type));
export const useActiveWidgets = () => useSelector(selectActiveWidgets);
export const useVisibleWidgets = () => useSelector(selectVisibleWidgets);
export const useWidgetsByDashboard = (dashboardId) => useSelector((state) => selectWidgetsByDashboard(state, dashboardId));

export const useWidgets = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchTypes = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchTypesCalled = useRef(false);

    const widgets = useSelector(selectWidgets);
    const currentWidget = useSelector(selectCurrentWidget);
    const widgetData = useSelector(selectWidgetData);
    const loading = useSelector(selectWidgetLoading);
    const loadingDetails = useSelector(selectWidgetDetailsLoading);
    const submitting = useSelector(selectWidgetSubmitting);
    const error = useSelector(selectWidgetError);
    const pagination = useSelector(selectWidgetPagination);
    const pageNum = useSelector(selectWidgetPage);
    const pageSizeNum = useSelector(selectWidgetPageSize);
    const total = useSelector(selectWidgetTotal);
    const totalPages = useSelector(selectWidgetTotalPages);
    const filters = useSelector(selectWidgetFilters);
    const count = useSelector(selectWidgetCount);
    const hasWidgets = useSelector(selectHasWidgets);
    const isLoading = useSelector(selectIsWidgetLoading);
    const hasError = useSelector(selectHasWidgetError);
    const types = useSelector(selectWidgetTypes);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchWidgets(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Widget ID is required'));
        return dispatch(fetchWidget(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Widget data is required'));
        return dispatch(createWidget(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Widget ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateWidget({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Widget ID is required'));
        return dispatch(deleteWidget(id)).unwrap();
    }, [dispatch]);

    const fetchData = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Widget ID is required'));
        return dispatch(fetchWidgetData(id)).unwrap();
    }, [dispatch]);

    const performAction = useCallback((id, action) => {
        if (!id) return Promise.reject(new Error('Widget ID is required'));
        if (!action) return Promise.reject(new Error('Action is required'));
        return dispatch(performWidgetAction({ id, action })).unwrap();
    }, [dispatch]);

    const refresh = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Widget ID is required'));
        return dispatch(refreshWidget(id)).unwrap();
    }, [dispatch]);

    const fetchTypes = useCallback(() => {
        return dispatch(fetchWidgetTypes()).unwrap();
    }, [dispatch]);

    const fetchByDashboard = useCallback((dashboardId) => {
        if (!dashboardId) return Promise.reject(new Error('Dashboard ID is required'));
        return dispatch(fetchWidgetsByDashboard(dashboardId)).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setWidgetFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetWidgetFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setWidgetPagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentWidget());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearWidgetErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllWidgets());
    }, [dispatch]);

    const clearData = useCallback(() => {
        dispatch(clearWidgetData());
    }, [dispatch]);

    const getById = useCallback((id) => widgets.find(w => w.id === id), [widgets]);
    const getByType = useCallback((type) => widgets.filter(w => w.widget_type === type), [widgets]);
    const getActive = useCallback(() => widgets.filter(w => w.is_active), [widgets]);
    const getVisible = useCallback(() => widgets.filter(w => w.is_visible), [widgets]);
    const getByDashboard = useCallback((dashboardId) => widgets.filter(w => w.dashboard === dashboardId), [widgets]);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    useEffect(() => {
        if (autoFetchTypes && !fetchTypesCalled.current) {
            fetchTypesCalled.current = true;
            fetchTypes();
        }
    }, [autoFetchTypes, fetchTypes]);

    return useMemo(() => ({
        widgets,
        currentWidget,
        widgetData,
        loading,
        loadingDetails,
        submitting,
        error,
        pagination,
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasWidgets,
        isLoading,
        hasError,
        types,
        fetchList,
        fetchOne,
        create,
        createWidget: create,
        update,
        updateWidget: update,
        remove,
        deleteWidget: remove,
        fetchData,
        performAction,
        refresh,
        refreshWidget: refresh,
        fetchTypes,
        fetchByDashboard,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        clearData,
        getById,
        getByType,
        getActive,
        getVisible,
        getByDashboard,
    }), [
        widgets,
        currentWidget,
        widgetData,
        loading,
        loadingDetails,
        submitting,
        error,
        pagination,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasWidgets,
        isLoading,
        hasError,
        types,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        fetchData,
        performAction,
        refresh,
        fetchTypes,
        fetchByDashboard,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        clearData,
        getById,
        getByType,
        getActive,
        getVisible,
        getByDashboard,
    ]);
};

export const useWidget = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const widget = useSelector((state) => selectWidgetById(state, id));
    const currentWidget = useSelector(selectCurrentWidget);
    const widgetData = useSelector(selectWidgetData);
    const loading = useSelector(selectWidgetDetailsLoading);
    const error = useSelector(selectWidgetError);

    const fetchOne = useCallback((widgetId) => {
        const targetId = widgetId || id;
        if (!targetId) return Promise.reject(new Error('Widget ID is required'));
        return dispatch(fetchWidget(targetId)).unwrap();
    }, [dispatch, id]);

    const updateOne = useCallback((targetIdOrData, data) => {
        let targetId = id;
        let updateData = targetIdOrData;
        if (data !== undefined) {
            targetId = targetIdOrData;
            updateData = data;
        }
        if (!targetId) return Promise.reject(new Error('Widget ID is required'));
        if (!updateData) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateWidget({ id: targetId, data: updateData })).unwrap();
    }, [dispatch, id]);

    const removeOne = useCallback((widgetId) => {
        const finalId = widgetId || id;
        if (!finalId) return Promise.reject(new Error('Widget ID is required'));
        return dispatch(deleteWidget(finalId)).unwrap();
    }, [dispatch, id]);

    const fetchDataOne = useCallback((widgetId) => {
        const finalId = widgetId || id;
        if (!finalId) return Promise.reject(new Error('Widget ID is required'));
        return dispatch(fetchWidgetData(finalId)).unwrap();
    }, [dispatch, id]);

    const performActionOne = useCallback((targetIdOrAction, action) => {
        let targetId = id;
        let actionName = targetIdOrAction;
        if (action !== undefined) {
            targetId = targetIdOrAction;
            actionName = action;
        }
        if (!targetId) return Promise.reject(new Error('Widget ID is required'));
        if (!actionName) return Promise.reject(new Error('Action is required'));
        return dispatch(performWidgetAction({ id: targetId, action: actionName })).unwrap();
    }, [dispatch, id]);

    const refreshOne = useCallback((widgetId) => {
        const finalId = widgetId || id;
        if (!finalId) return Promise.reject(new Error('Widget ID is required'));
        return dispatch(refreshWidget(finalId)).unwrap();
    }, [dispatch, id]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentWidget());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearWidgetErrors());
    }, [dispatch]);

    const clearData = useCallback(() => {
        dispatch(clearWidgetData());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch && id && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchOne(id);
        }
        return () => {
            clearCurrent();
        };
    }, [autoFetch, id, fetchOne, clearCurrent]);

    const resolvedWidget = useMemo(() => {
        if (currentWidget && currentWidget.id === id) return currentWidget;
        return widget || currentWidget;
    }, [currentWidget, widget, id]);

    return useMemo(() => ({
        widget: resolvedWidget,
        widgetData,
        loading,
        error,
        fetchOne,
        update: updateOne,
        updateWidget: updateOne,
        remove: removeOne,
        deleteWidget: removeOne,
        fetchData: fetchDataOne,
        performAction: performActionOne,
        refresh: refreshOne,
        refreshWidget: refreshOne,
        clearCurrent,
        clearErrors,
        clearData,
    }), [
        resolvedWidget,
        widgetData,
        loading,
        error,
        fetchOne,
        updateOne,
        removeOne,
        fetchDataOne,
        performActionOne,
        refreshOne,
        clearCurrent,
        clearErrors,
        clearData,
    ]);
};