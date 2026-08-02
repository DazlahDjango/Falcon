// ============================================
// frontend/src/hooks/reports/useExecutions.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchExecutions,
    fetchExecution,
    fetchExecutionLogs,
    fetchExecutionsByReport,
    fetchExecutionStatuses,
    clearCurrentExecution,
    clearExecutionErrors,
    setExecutionFilters,
    resetExecutionFilters,
    setExecutionPagination,
    clearAllExecutions,
} from '../../store/reports/slice/execution.slice';
import {
    selectExecutions,
    selectCurrentExecution,
    selectExecutionLogs,
    selectExecutionLoading,
    selectExecutionDetailsLoading,
    selectExecutionError,
    selectExecutionPagination,
    selectExecutionPage,
    selectExecutionPageSize,
    selectExecutionTotal,
    selectExecutionTotalPages,
    selectExecutionFilters,
    selectExecutionById,
    selectExecutionsByStatus,
    selectExecutionsByReport,
    selectCompletedExecutions,
    selectFailedExecutions,
    selectRunningExecutions,
    selectExecutionCount,
    selectHasExecutions,
    selectIsExecutionLoading,
    selectHasExecutionError,
    selectExecutionStatuses,
} from '../../store/reports/selectors/execution.selectors';

export const useExecutions = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchStatuses = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchStatusesCalled = useRef(false);

    const executions = useSelector(selectExecutions);
    const currentExecution = useSelector(selectCurrentExecution);
    const executionLogs = useSelector(selectExecutionLogs);
    const loading = useSelector(selectExecutionLoading);
    const loadingDetails = useSelector(selectExecutionDetailsLoading);
    const error = useSelector(selectExecutionError);
    const pagination = useSelector(selectExecutionPagination);
    const pageNum = useSelector(selectExecutionPage);
    const pageSizeNum = useSelector(selectExecutionPageSize);
    const total = useSelector(selectExecutionTotal);
    const totalPages = useSelector(selectExecutionTotalPages);
    const filters = useSelector(selectExecutionFilters);
    const count = useSelector(selectExecutionCount);
    const hasExecutions = useSelector(selectHasExecutions);
    const isLoading = useSelector(selectIsExecutionLoading);
    const hasError = useSelector(selectHasExecutionError);
    const statuses = useSelector(selectExecutionStatuses);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchExecutions(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Execution ID is required'));
        return dispatch(fetchExecution(id)).unwrap();
    }, [dispatch]);

    const fetchLogs = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Execution ID is required'));
        return dispatch(fetchExecutionLogs(id)).unwrap();
    }, [dispatch]);

    const fetchByReport = useCallback((reportId) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        return dispatch(fetchExecutionsByReport(reportId)).unwrap();
    }, [dispatch]);

    const fetchStatuses = useCallback(() => {
        return dispatch(fetchExecutionStatuses()).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setExecutionFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetExecutionFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setExecutionPagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentExecution());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearExecutionErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllExecutions());
    }, [dispatch]);

    const getById = useCallback((id) => executions.find(e => e.id === id), [executions]);
    const getByStatus = useCallback((status) => executions.filter(e => e.status === status), [executions]);
    const getByReport = useCallback((reportId) => executions.filter(e => e.report === reportId), [executions]);
    const getCompleted = useCallback(() => executions.filter(e => e.status === 'completed'), [executions]);
    const getFailed = useCallback(() => executions.filter(e => e.status === 'failed'), [executions]);
    const getRunning = useCallback(() => executions.filter(e => e.status === 'running' || e.status === 'generating'), [executions]);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    useEffect(() => {
        if (autoFetchStatuses && !fetchStatusesCalled.current) {
            fetchStatusesCalled.current = true;
            fetchStatuses();
        }
    }, [autoFetchStatuses, fetchStatuses]);

    return useMemo(() => ({
        executions,
        currentExecution,
        executionLogs,
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
        hasExecutions,
        isLoading,
        hasError,
        statuses,
        fetchList,
        fetchOne,
        fetchLogs,
        fetchByReport,
        fetchStatuses,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        getById,
        getByStatus,
        getByReport,
        getCompleted,
        getFailed,
        getRunning,
    }), [
        executions,
        currentExecution,
        executionLogs,
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
        hasExecutions,
        isLoading,
        hasError,
        statuses,
        fetchList,
        fetchOne,
        fetchLogs,
        fetchByReport,
        fetchStatuses,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        getById,
        getByStatus,
        getByReport,
        getCompleted,
        getFailed,
        getRunning,
    ]);
};

export const useExecution = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const execution = useSelector((state) => selectExecutionById(state, id));
    const currentExecution = useSelector(selectCurrentExecution);
    const loading = useSelector(selectExecutionDetailsLoading);
    const error = useSelector(selectExecutionError);
    const logs = useSelector(selectExecutionLogs);

    const fetchOne = useCallback((execId) => {
        if (!execId) return Promise.reject(new Error('Execution ID is required'));
        return dispatch(fetchExecution(execId)).unwrap();
    }, [dispatch]);

    const fetchLogs = useCallback((execId) => {
        if (!execId) return Promise.reject(new Error('Execution ID is required'));
        return dispatch(fetchExecutionLogs(execId)).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentExecution());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearExecutionErrors());
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

    const resolvedExecution = useMemo(() => {
        if (currentExecution && currentExecution.id === id) return currentExecution;
        return execution || currentExecution;
    }, [currentExecution, execution, id]);

    return useMemo(() => ({
        execution: resolvedExecution,
        logs,
        loading,
        error,
        fetchOne,
        fetchLogs,
        clearCurrent,
        clearErrors,
    }), [
        resolvedExecution,
        logs,
        loading,
        error,
        fetchOne,
        fetchLogs,
        clearCurrent,
        clearErrors,
    ]);
};