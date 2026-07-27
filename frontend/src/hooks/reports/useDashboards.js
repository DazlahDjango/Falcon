// ============================================
// frontend/src/hooks/reports/useDashboards.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDashboards,
    fetchDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    performDashboardAction,
    updateDashboardLayout,
    refreshDashboard,
    fetchMyDashboards,
    fetchDefaultDashboard,
    fetchDashboardTypes,
    clearCurrentDashboard,
    clearDashboardErrors,
    setDashboardFilters,
    resetDashboardFilters,
    setDashboardPagination,
    clearAllDashboards,
    updateLayoutState,
} from '../../store/reports/slice/dashboard.slice';
import {
    selectDashboards,
    selectCurrentDashboard,
    selectMyDashboards,
    selectDefaultDashboard,
    selectDashboardLoading,
    selectDashboardDetailsLoading,
    selectDashboardSubmitting,
    selectDashboardError,
    selectDashboardPagination,
    selectDashboardPage,
    selectDashboardPageSize,
    selectDashboardTotal,
    selectDashboardTotalPages,
    selectDashboardFilters,
    selectDashboardById,
    selectDashboardsByType,
    selectSharedDashboards,
    selectPublishedDashboards,
    selectDashboardCount,
    selectHasDashboards,
    selectIsDashboardLoading,
    selectHasDashboardError,
    selectDashboardTypes,
    selectDashboardLayout,
} from '../../store/reports/selectors/dashboard.selectors';

export const useDashboards = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchMy = false,
        autoFetchDefault = false,
        autoFetchTypes = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchMyCalled = useRef(false);
    const fetchDefaultCalled = useRef(false);
    const fetchTypesCalled = useRef(false);

    const dashboards = useSelector(selectDashboards);
    const currentDashboard = useSelector(selectCurrentDashboard);
    const myDashboards = useSelector(selectMyDashboards);
    const defaultDashboard = useSelector(selectDefaultDashboard);
    const loading = useSelector(selectDashboardLoading);
    const loadingDetails = useSelector(selectDashboardDetailsLoading);
    const submitting = useSelector(selectDashboardSubmitting);
    const error = useSelector(selectDashboardError);
    const pagination = useSelector(selectDashboardPagination);
    const pageNum = useSelector(selectDashboardPage);
    const pageSizeNum = useSelector(selectDashboardPageSize);
    const total = useSelector(selectDashboardTotal);
    const totalPages = useSelector(selectDashboardTotalPages);
    const filters = useSelector(selectDashboardFilters);
    const count = useSelector(selectDashboardCount);
    const hasDashboards = useSelector(selectHasDashboards);
    const isLoading = useSelector(selectIsDashboardLoading);
    const hasError = useSelector(selectHasDashboardError);
    const types = useSelector(selectDashboardTypes);
    const layout = useSelector(selectDashboardLayout);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchDashboards(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchMyList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchMyDashboards(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Dashboard ID is required'));
        return dispatch(fetchDashboard(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Dashboard data is required'));
        return dispatch(createDashboard(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Dashboard ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateDashboard({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Dashboard ID is required'));
        return dispatch(deleteDashboard(id)).unwrap();
    }, [dispatch]);

    const performAction = useCallback((id, action, data = {}) => {
        if (!id) return Promise.reject(new Error('Dashboard ID is required'));
        if (!action) return Promise.reject(new Error('Action is required'));
        return dispatch(performDashboardAction({ id, action, data })).unwrap();
    }, [dispatch]);

    const updateLayout = useCallback((id, layoutData) => {
        if (!id) return Promise.reject(new Error('Dashboard ID is required'));
        if (!layoutData) return Promise.reject(new Error('Layout data is required'));
        return dispatch(updateDashboardLayout({ id, layout: layoutData })).unwrap();
    }, [dispatch]);

    const refresh = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Dashboard ID is required'));
        return dispatch(refreshDashboard(id)).unwrap();
    }, [dispatch]);

    const fetchDefault = useCallback(() => {
        return dispatch(fetchDefaultDashboard()).unwrap();
    }, [dispatch]);

    const fetchTypes = useCallback(() => {
        return dispatch(fetchDashboardTypes()).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setDashboardFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetDashboardFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setDashboardPagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentDashboard());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearDashboardErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllDashboards());
    }, [dispatch]);

    const updateLayoutStateLocal = useCallback((layoutData) => {
        dispatch(updateLayoutState(layoutData));
    }, [dispatch]);

    const getById = useCallback((id) => {
        return useSelector((state) => selectDashboardById(state, id));
    }, []);

    const getByType = useCallback((type) => {
        return useSelector((state) => selectDashboardsByType(state, type));
    }, []);

    const getShared = useCallback(() => {
        return useSelector(selectSharedDashboards);
    }, []);

    const getPublished = useCallback(() => {
        return useSelector(selectPublishedDashboards);
    }, []);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    useEffect(() => {
        if (autoFetchMy && !fetchMyCalled.current) {
            fetchMyCalled.current = true;
            fetchMyList(initialFilters);
        }
    }, [autoFetchMy, initialFilters, fetchMyList]);

    useEffect(() => {
        if (autoFetchDefault && !fetchDefaultCalled.current) {
            fetchDefaultCalled.current = true;
            fetchDefault();
        }
    }, [autoFetchDefault, fetchDefault]);

    useEffect(() => {
        if (autoFetchTypes && !fetchTypesCalled.current) {
            fetchTypesCalled.current = true;
            fetchTypes();
        }
    }, [autoFetchTypes, fetchTypes]);

    return useMemo(() => ({
        dashboards,
        currentDashboard,
        myDashboards,
        defaultDashboard,
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
        hasDashboards,
        isLoading,
        hasError,
        types,
        layout,
        fetchList,
        fetchMyList,
        fetchOne,
        create,
        update,
        remove,
        performAction,
        updateLayout,
        refresh,
        fetchDefault,
        fetchTypes,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        updateLayoutStateLocal,
        getById,
        getByType,
        getShared,
        getPublished,
    }), [
        dashboards,
        currentDashboard,
        myDashboards,
        defaultDashboard,
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
        hasDashboards,
        isLoading,
        hasError,
        types,
        layout,
        fetchList,
        fetchMyList,
        fetchOne,
        create,
        update,
        remove,
        performAction,
        updateLayout,
        refresh,
        fetchDefault,
        fetchTypes,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        updateLayoutStateLocal,
        getById,
        getByType,
        getShared,
        getPublished,
    ]);
};

export const useDashboard = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const dashboard = useSelector((state) => selectDashboardById(state, id));
    const currentDashboard = useSelector(selectCurrentDashboard);
    const loading = useSelector(selectDashboardDetailsLoading);
    const error = useSelector(selectDashboardError);

    const fetchOne = useCallback((dashboardId) => {
        if (!dashboardId) return Promise.reject(new Error('Dashboard ID is required'));
        return dispatch(fetchDashboard(dashboardId)).unwrap();
    }, [dispatch]);

    const removeOne = useCallback((dashboardId) => {
        if (!dashboardId) return Promise.reject(new Error('Dashboard ID is required'));
        return dispatch(deleteDashboard(dashboardId)).unwrap();
    }, [dispatch]);

    const refreshDashboardOne = useCallback((dashboardId) => {
        if (!dashboardId) return Promise.reject(new Error('Dashboard ID is required'));
        return dispatch(refreshDashboard(dashboardId)).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentDashboard());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearDashboardErrors());
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

    const resolvedDashboard = useMemo(() => {
        if (currentDashboard && currentDashboard.id === id) return currentDashboard;
        return dashboard || currentDashboard;
    }, [currentDashboard, dashboard, id]);

    return useMemo(() => ({
        dashboard: resolvedDashboard,
        loading,
        error,
        fetchOne,
        remove: removeOne,
        refreshDashboard: refreshDashboardOne,
        clearCurrent,
        clearErrors,
    }), [
        resolvedDashboard,
        loading,
        error,
        fetchOne,
        removeOne,
        refreshDashboardOne,
        clearCurrent,
        clearErrors,
    ]);
};