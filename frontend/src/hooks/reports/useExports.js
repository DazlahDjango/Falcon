// ============================================
// frontend/src/hooks/reports/useExports.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchExports,
    fetchExport,
    createExport,
    downloadExport,
    regenerateExport,
    deleteExport,
    fetchMyExports,
    fetchExportFormats,
    clearCurrentExport,
    clearExportErrors,
    setExportFilters,
    resetExportFilters,
    setExportPagination,
    clearAllExports,
    resetDownloading,
} from '../../store/reports/slice/export.slice';
import {
    selectExports,
    selectCurrentExport,
    selectMyExports,
    selectExportLoading,
    selectExportDetailsLoading,
    selectExportSubmitting,
    selectExportDownloading,
    selectExportError,
    selectExportPagination,
    selectExportPage,
    selectExportPageSize,
    selectExportTotal,
    selectExportTotalPages,
    selectExportFilters,
    selectExportById,
    selectExportsByFormat,
    selectExportsByStatus,
    selectCompletedExports,
    selectReadyExports,
    selectExportCount,
    selectHasExports,
    selectIsExportLoading,
    selectHasExportError,
    selectExportFormats,
} from '../../store/reports/selectors/export.selectors';

export const useExports = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchMy = false,
        autoFetchFormats = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchMyCalled = useRef(false);
    const fetchFormatsCalled = useRef(false);

    const exports = useSelector(selectExports);
    const currentExport = useSelector(selectCurrentExport);
    const myExports = useSelector(selectMyExports);
    const loading = useSelector(selectExportLoading);
    const loadingDetails = useSelector(selectExportDetailsLoading);
    const submitting = useSelector(selectExportSubmitting);
    const downloading = useSelector(selectExportDownloading);
    const error = useSelector(selectExportError);
    const pagination = useSelector(selectExportPagination);
    const pageNum = useSelector(selectExportPage);
    const pageSizeNum = useSelector(selectExportPageSize);
    const total = useSelector(selectExportTotal);
    const totalPages = useSelector(selectExportTotalPages);
    const filters = useSelector(selectExportFilters);
    const count = useSelector(selectExportCount);
    const hasExports = useSelector(selectHasExports);
    const isLoading = useSelector(selectIsExportLoading);
    const hasError = useSelector(selectHasExportError);
    const formats = useSelector(selectExportFormats);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchExports(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchMyList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchMyExports(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Export ID is required'));
        return dispatch(fetchExport(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Export data is required'));
        return dispatch(createExport(data)).unwrap();
    }, [dispatch]);

    const download = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Export ID is required'));
        return dispatch(downloadExport(id)).unwrap();
    }, [dispatch]);

    const regenerate = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Export ID is required'));
        return dispatch(regenerateExport(id)).unwrap();
    }, [dispatch]);

    const fetchFormats = useCallback(() => {
        return dispatch(fetchExportFormats()).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setExportFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetExportFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setExportPagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentExport());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearExportErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllExports());
    }, [dispatch]);

    const resetDownloadingState = useCallback(() => {
        dispatch(resetDownloading());
    }, [dispatch]);

    const getById = useCallback((id) => exports.find(e => e.id === id), [exports]);
    const getByFormat = useCallback((format) => exports.filter(e => e.format === format), [exports]);
    const getByStatus = useCallback((status) => exports.filter(e => e.status === status), [exports]);
    const getCompleted = useCallback(() => exports.filter(e => e.status === 'completed'), [exports]);
    const getReady = useCallback(() => exports.filter(e => e.status === 'completed' && e.file_url), [exports]);

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
        if (autoFetchFormats && !fetchFormatsCalled.current) {
            fetchFormatsCalled.current = true;
            fetchFormats();
        }
    }, [autoFetchFormats, fetchFormats]);

    return useMemo(() => ({
        exports,
        currentExport,
        myExports,
        loading,
        loadingDetails,
        submitting,
        downloading,
        error,
        pagination,
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasExports,
        isLoading,
        hasError,
        formats,
        fetchList,
        fetchMyList,
        fetchOne,
        create,
        download,
        regenerate,
        fetchFormats,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        resetDownloadingState,
        getById,
        getByFormat,
        getByStatus,
        getCompleted,
        getReady,
    }), [
        exports,
        currentExport,
        myExports,
        loading,
        loadingDetails,
        submitting,
        downloading,
        error,
        pagination,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasExports,
        isLoading,
        hasError,
        formats,
        fetchList,
        fetchMyList,
        fetchOne,
        create,
        download,
        regenerate,
        fetchFormats,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        resetDownloadingState,
        getById,
        getByFormat,
        getByStatus,
        getCompleted,
        getReady,
    ]);
};

export const useExport = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const exportItem = useSelector((state) => selectExportById(state, id));
    const currentExport = useSelector(selectCurrentExport);
    const loading = useSelector(selectExportDetailsLoading);
    const error = useSelector(selectExportError);

    const fetchOne = useCallback((exportId) => {
        if (!exportId) return Promise.reject(new Error('Export ID is required'));
        return dispatch(fetchExport(exportId)).unwrap();
    }, [dispatch]);

    const removeOne = useCallback((exportId) => {
        if (!exportId) return Promise.reject(new Error('Export ID is required'));
        return dispatch(deleteExport(exportId)).unwrap();
    }, [dispatch]);

    const regenerateOne = useCallback((exportId) => {
        if (!exportId) return Promise.reject(new Error('Export ID is required'));
        return dispatch(regenerateExport(exportId)).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentExport());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearExportErrors());
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

    const resolvedExport = useMemo(() => {
        if (currentExport && currentExport.id === id) return currentExport;
        return exportItem || currentExport;
    }, [currentExport, exportItem, id]);

    return useMemo(() => ({
        exportItem: resolvedExport,
        loading,
        error,
        fetchOne,
        remove: removeOne,
        regenerate: regenerateOne,
        clearCurrent,
        clearErrors,
    }), [
        resolvedExport,
        loading,
        error,
        fetchOne,
        removeOne,
        regenerateOne,
        clearCurrent,
        clearErrors,
    ]);
};