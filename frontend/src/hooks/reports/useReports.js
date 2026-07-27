// ============================================
// frontend/src/hooks/reports/useReports.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    exportReport,
    updateReportStatus,
    performReportAction,
    fetchMyReports,
    fetchPublicReports,
    fetchReportTypes,
    fetchReportStatuses,
    clearCurrentReport,
    clearReportErrors,
    setReportFilters,
    resetReportFilters,
    setReportPagination,
    clearAllReports,
    updateGenerationProgress,
    resetGenerationStatus,
} from '../../store/reports/slice/report.slice';
import {
    selectReports,
    selectCurrentReport,
    selectMyReports,
    selectPublicReports,
    selectReportLoading,
    selectReportDetailsLoading,
    selectReportSubmitting,
    selectReportGenerating,
    selectReportError,
    selectReportPagination,
    selectReportPage,
    selectReportPageSize,
    selectReportTotal,
    selectReportTotalPages,
    selectReportFilters,
    selectReportById,
    selectReportsByType,
    selectReportsByStatus,
    selectReportsByCategory,
    selectPublishedReports,
    selectArchivedReports,
    selectActiveReports,
    selectReportCount,
    selectPublishedReportCount,
    selectHasReports,
    selectIsReportLoading,
    selectHasReportError,
    selectReportGenerationStatus,
    selectReportGenerationProgress,
    selectReportTypes,
    selectReportStatuses,
    selectReportCategories,
    selectReportFormats,
} from '../../store/reports/selectors/report.selectors';

export const useReports = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchMy = false,
        autoFetchPublic = false,
        autoFetchTypes = false,
        autoFetchStatuses = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchMyCalled = useRef(false);
    const fetchPublicCalled = useRef(false);
    const fetchTypesCalled = useRef(false);
    const fetchStatusesCalled = useRef(false);

    const reports = useSelector(selectReports);
    const currentReport = useSelector(selectCurrentReport);
    const myReports = useSelector(selectMyReports);
    const publicReports = useSelector(selectPublicReports);
    const loading = useSelector(selectReportLoading);
    const loadingDetails = useSelector(selectReportDetailsLoading);
    const submitting = useSelector(selectReportSubmitting);
    const generating = useSelector(selectReportGenerating);
    const error = useSelector(selectReportError);
    const pagination = useSelector(selectReportPagination);
    const pageNum = useSelector(selectReportPage);
    const pageSizeNum = useSelector(selectReportPageSize);
    const total = useSelector(selectReportTotal);
    const totalPages = useSelector(selectReportTotalPages);
    const filters = useSelector(selectReportFilters);
    const count = useSelector(selectReportCount);
    const publishedCount = useSelector(selectPublishedReportCount);
    const hasReports = useSelector(selectHasReports);
    const isLoading = useSelector(selectIsReportLoading);
    const hasError = useSelector(selectHasReportError);
    const generationStatus = useSelector(selectReportGenerationStatus);
    const generationProgress = useSelector(selectReportGenerationProgress);
    const types = useSelector(selectReportTypes);
    const statuses = useSelector(selectReportStatuses);
    const categories = useSelector(selectReportCategories);
    const formats = useSelector(selectReportFormats);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchReports(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchMyList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchMyReports(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchPublicList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchPublicReports(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Report ID is required'));
        return dispatch(fetchReport(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Report data is required'));
        return dispatch(createReport(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Report ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateReport({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Report ID is required'));
        return dispatch(deleteReport(id)).unwrap();
    }, [dispatch]);

    const generate = useCallback((id, params = {}) => {
        if (!id) return Promise.reject(new Error('Report ID is required'));
        return dispatch(generateReport({ id, params })).unwrap();
    }, [dispatch]);

    const exportReport = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Report ID is required'));
        if (!data) return Promise.reject(new Error('Export data is required'));
        return dispatch(exportReport({ id, data })).unwrap();
    }, [dispatch]);

    const updateStatus = useCallback((id, status) => {
        if (!id) return Promise.reject(new Error('Report ID is required'));
        if (!status) return Promise.reject(new Error('Status is required'));
        return dispatch(updateReportStatus({ id, status })).unwrap();
    }, [dispatch]);

    const performAction = useCallback((id, action, data = {}) => {
        if (!id) return Promise.reject(new Error('Report ID is required'));
        if (!action) return Promise.reject(new Error('Action is required'));
        return dispatch(performReportAction({ id, action, data })).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setReportFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetReportFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setReportPagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentReport());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearReportErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllReports());
    }, [dispatch]);

    const resetGeneration = useCallback(() => {
        dispatch(resetGenerationStatus());
    }, [dispatch]);

    const updateProgress = useCallback((progress) => {
        dispatch(updateGenerationProgress(progress));
    }, [dispatch]);

    const getById = useCallback((id) => {
        return useSelector((state) => selectReportById(state, id));
    }, []);

    const getByType = useCallback((type) => {
        return useSelector((state) => selectReportsByType(state, type));
    }, []);

    const getByStatus = useCallback((status) => {
        return useSelector((state) => selectReportsByStatus(state, status));
    }, []);

    const getByCategory = useCallback((category) => {
        return useSelector((state) => selectReportsByCategory(state, category));
    }, []);

    const getPublished = useCallback(() => {
        return useSelector(selectPublishedReports);
    }, []);

    const getArchived = useCallback(() => {
        return useSelector(selectArchivedReports);
    }, []);

    const getActive = useCallback(() => {
        return useSelector(selectActiveReports);
    }, []);

    const fetchTypes = useCallback(() => {
        return dispatch(fetchReportTypes()).unwrap();
    }, [dispatch]);

    const fetchStatuses = useCallback(() => {
        return dispatch(fetchReportStatuses()).unwrap();
    }, [dispatch]);

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
        if (autoFetchPublic && !fetchPublicCalled.current) {
            fetchPublicCalled.current = true;
            fetchPublicList(initialFilters);
        }
    }, [autoFetchPublic, initialFilters, fetchPublicList]);

    useEffect(() => {
        if (autoFetchTypes && !fetchTypesCalled.current) {
            fetchTypesCalled.current = true;
            fetchTypes();
        }
    }, [autoFetchTypes, fetchTypes]);

    useEffect(() => {
        if (autoFetchStatuses && !fetchStatusesCalled.current) {
            fetchStatusesCalled.current = true;
            fetchStatuses();
        }
    }, [autoFetchStatuses, fetchStatuses]);

    return useMemo(() => ({
        reports,
        currentReport,
        myReports,
        publicReports,
        loading,
        loadingDetails,
        submitting,
        generating,
        error,
        pagination,
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        publishedCount,
        hasReports,
        isLoading,
        hasError,
        generationStatus,
        generationProgress,
        types,
        statuses,
        categories,
        formats,
        fetchList,
        fetchMyList,
        fetchPublicList,
        fetchOne,
        create,
        update,
        remove,
        generate,
        exportReport,
        updateStatus,
        performAction,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        resetGeneration,
        updateProgress,
        getById,
        getByType,
        getByStatus,
        getByCategory,
        getPublished,
        getArchived,
        getActive,
        fetchTypes,
        fetchStatuses,
    }), [
        reports,
        currentReport,
        myReports,
        publicReports,
        loading,
        loadingDetails,
        submitting,
        generating,
        error,
        pagination,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        publishedCount,
        hasReports,
        isLoading,
        hasError,
        generationStatus,
        generationProgress,
        types,
        statuses,
        categories,
        formats,
        fetchList,
        fetchMyList,
        fetchPublicList,
        fetchOne,
        create,
        update,
        remove,
        generate,
        exportReport,
        updateStatus,
        performAction,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        resetGeneration,
        updateProgress,
        getById,
        getByType,
        getByStatus,
        getByCategory,
        getPublished,
        getArchived,
        getActive,
        fetchTypes,
        fetchStatuses,
    ]);
};

export const useReport = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const report = useSelector((state) => selectReportById(state, id));
    const currentReport = useSelector(selectCurrentReport);
    const loading = useSelector(selectReportDetailsLoading);
    const error = useSelector(selectReportError);

    const fetchOne = useCallback((reportId) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        return dispatch(fetchReport(reportId)).unwrap();
    }, [dispatch]);

    const updateOne = useCallback((reportId, data) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateReport({ id: reportId, data })).unwrap();
    }, [dispatch]);

    const removeOne = useCallback((reportId) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        return dispatch(deleteReport(reportId)).unwrap();
    }, [dispatch]);

    const generateOne = useCallback((reportId, params = {}) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        return dispatch(generateReport({ id: reportId, params })).unwrap();
    }, [dispatch]);

    const exportOne = useCallback((reportId, data) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        if (!data) return Promise.reject(new Error('Export data is required'));
        return dispatch(exportReport({ id: reportId, data })).unwrap();
    }, [dispatch]);

    const updateStatusOne = useCallback((reportId, status) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        if (!status) return Promise.reject(new Error('Status is required'));
        return dispatch(updateReportStatus({ id: reportId, status })).unwrap();
    }, [dispatch]);

    const performActionOne = useCallback((reportId, action, data = {}) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        if (!action) return Promise.reject(new Error('Action is required'));
        return dispatch(performReportAction({ id: reportId, action, data })).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentReport());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearReportErrors());
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

    const resolvedReport = useMemo(() => {
        if (currentReport && currentReport.id === id) return currentReport;
        return report || currentReport;
    }, [currentReport, report, id]);

    return useMemo(() => ({
        report: resolvedReport,
        loading,
        error,
        fetchOne,
        update: updateOne,
        remove: removeOne,
        generate: generateOne,
        export: exportOne,
        updateStatus: updateStatusOne,
        performAction: performActionOne,
        clearCurrent,
        clearErrors,
    }), [
        resolvedReport,
        loading,
        error,
        fetchOne,
        updateOne,
        removeOne,
        generateOne,
        exportOne,
        updateStatusOne,
        performActionOne,
        clearCurrent,
        clearErrors,
    ]);
};