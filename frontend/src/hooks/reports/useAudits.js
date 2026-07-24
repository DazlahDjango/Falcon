// ============================================
// frontend/src/hooks/reports/useAudits.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAudits,
    fetchAudit,
    fetchAuditsByReport,
    fetchAuditsByUser,
    fetchAuditActions,
    fetchAuditStats,
    clearCurrentAudit,
    clearAuditErrors,
    setAuditFilters,
    resetAuditFilters,
    setAuditPagination,
    clearAllAudits,
    clearStats,
} from '../../store/reports/slice/audit.slice';
import {
    selectAudits,
    selectCurrentAudit,
    selectAuditLoading,
    selectAuditDetailsLoading,
    selectAuditError,
    selectAuditPagination,
    selectAuditPage,
    selectAuditPageSize,
    selectAuditTotal,
    selectAuditTotalPages,
    selectAuditFilters,
    selectAuditById,
    selectAuditsByAction,
    selectAuditsByReport,
    selectAuditsByUser,
    selectSuccessfulAudits,
    selectFailedAudits,
    selectAuditCount,
    selectHasAudits,
    selectIsAuditLoading,
    selectHasAuditError,
    selectAuditActions,
    selectAuditStats,
} from '../../store/reports/selectors/audit.selectors';

export const useAudits = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchActions = false,
        autoFetchStats = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchActionsCalled = useRef(false);
    const fetchStatsCalled = useRef(false);

    const audits = useSelector(selectAudits);
    const currentAudit = useSelector(selectCurrentAudit);
    const loading = useSelector(selectAuditLoading);
    const loadingDetails = useSelector(selectAuditDetailsLoading);
    const error = useSelector(selectAuditError);
    const pagination = useSelector(selectAuditPagination);
    const pageNum = useSelector(selectAuditPage);
    const pageSizeNum = useSelector(selectAuditPageSize);
    const total = useSelector(selectAuditTotal);
    const totalPages = useSelector(selectAuditTotalPages);
    const filters = useSelector(selectAuditFilters);
    const count = useSelector(selectAuditCount);
    const hasAudits = useSelector(selectHasAudits);
    const isLoading = useSelector(selectIsAuditLoading);
    const hasError = useSelector(selectHasAuditError);
    const actions = useSelector(selectAuditActions);
    const stats = useSelector(selectAuditStats);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchAudits(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Audit ID is required'));
        return dispatch(fetchAudit(id)).unwrap();
    }, [dispatch]);

    const fetchByReport = useCallback((reportId) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        return dispatch(fetchAuditsByReport(reportId)).unwrap();
    }, [dispatch]);

    const fetchByUser = useCallback((userId) => {
        if (!userId) return Promise.reject(new Error('User ID is required'));
        return dispatch(fetchAuditsByUser(userId)).unwrap();
    }, [dispatch]);

    const fetchActions = useCallback(() => {
        return dispatch(fetchAuditActions()).unwrap();
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchAuditStats()).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setAuditFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetAuditFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setAuditPagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentAudit());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearAuditErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllAudits());
    }, [dispatch]);

    const clearAuditStats = useCallback(() => {
        dispatch(clearStats());
    }, [dispatch]);

    const getById = useCallback((id) => {
        return useSelector((state) => selectAuditById(state, id));
    }, []);

    const getByAction = useCallback((action) => {
        return useSelector((state) => selectAuditsByAction(state, action));
    }, []);

    const getByReport = useCallback((reportId) => {
        return useSelector((state) => selectAuditsByReport(state, reportId));
    }, []);

    const getByUser = useCallback((userId) => {
        return useSelector((state) => selectAuditsByUser(state, userId));
    }, []);

    const getSuccessful = useCallback(() => {
        return useSelector(selectSuccessfulAudits);
    }, []);

    const getFailed = useCallback(() => {
        return useSelector(selectFailedAudits);
    }, []);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    useEffect(() => {
        if (autoFetchActions && !fetchActionsCalled.current) {
            fetchActionsCalled.current = true;
            fetchActions();
        }
    }, [autoFetchActions, fetchActions]);

    useEffect(() => {
        if (autoFetchStats && !fetchStatsCalled.current) {
            fetchStatsCalled.current = true;
            fetchStats();
        }
    }, [autoFetchStats, fetchStats]);

    return useMemo(() => ({
        audits,
        currentAudit,
        loading,
        loadingDetails,
        error,
        pagination,
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasAudits,
        isLoading,
        hasError,
        actions,
        stats,
        fetchList,
        fetchOne,
        fetchByReport,
        fetchByUser,
        fetchActions,
        fetchStats,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        clearAuditStats,
        getById,
        getByAction,
        getByReport,
        getByUser,
        getSuccessful,
        getFailed,
    }), [
        audits,
        currentAudit,
        loading,
        loadingDetails,
        error,
        pagination,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasAudits,
        isLoading,
        hasError,
        actions,
        stats,
        fetchList,
        fetchOne,
        fetchByReport,
        fetchByUser,
        fetchActions,
        fetchStats,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        clearAuditStats,
        getById,
        getByAction,
        getByReport,
        getByUser,
        getSuccessful,
        getFailed,
    ]);
};

export const useAudit = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const audit = useSelector((state) => selectAuditById(state, id));
    const currentAudit = useSelector(selectCurrentAudit);
    const loading = useSelector(selectAuditDetailsLoading);
    const error = useSelector(selectAuditError);

    const fetchOne = useCallback((auditId) => {
        if (!auditId) return Promise.reject(new Error('Audit ID is required'));
        return dispatch(fetchAudit(auditId)).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentAudit());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearAuditErrors());
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

    const resolvedAudit = useMemo(() => {
        if (currentAudit && currentAudit.id === id) return currentAudit;
        return audit || currentAudit;
    }, [currentAudit, audit, id]);

    return useMemo(() => ({
        audit: resolvedAudit,
        loading,
        error,
        fetchOne,
        clearCurrent,
        clearErrors,
    }), [
        resolvedAudit,
        loading,
        error,
        fetchOne,
        clearCurrent,
        clearErrors,
    ]);
};