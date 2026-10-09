// ============================================
// frontend/src/hooks/reports/usePresets.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPresets,
    fetchPreset,
    createPreset,
    updatePreset,
    deletePreset,
    clearCurrentPreset,
    clearPresetErrors,
    setPresetFilters,
    resetPresetFilters,
    setPresetPagination,
    clearAllPresets,
} from '../../store/reports/slice/preset.slice';
import {
    selectPresets,
    selectCurrentPreset,
    selectPresetLoading,
    selectPresetDetailsLoading,
    selectPresetSubmitting,
    selectPresetError,
    selectPresetPagination,
    selectPresetPage,
    selectPresetPageSize,
    selectPresetTotal,
    selectPresetTotalPages,
    selectPresetFilters,
    selectPresetById,
    selectPresetsByReport,
    selectDefaultPreset,
    selectPresetCount,
    selectHasPresets,
    selectIsPresetLoading,
    selectHasPresetError,
} from '../../store/reports/selectors/preset.selectors';

export const usePresets = (options = {}) => {
    const {
        autoFetch = true,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const presets = useSelector(selectPresets);
    const currentPreset = useSelector(selectCurrentPreset);
    const defaultPreset = useSelector(selectDefaultPreset);
    const loading = useSelector(selectPresetLoading);
    const loadingDetails = useSelector(selectPresetDetailsLoading);
    const submitting = useSelector(selectPresetSubmitting);
    const error = useSelector(selectPresetError);
    const pagination = useSelector(selectPresetPagination);
    const pageNum = useSelector(selectPresetPage);
    const pageSizeNum = useSelector(selectPresetPageSize);
    const total = useSelector(selectPresetTotal);
    const totalPages = useSelector(selectPresetTotalPages);
    const filters = useSelector(selectPresetFilters);
    const count = useSelector(selectPresetCount);
    const hasPresets = useSelector(selectHasPresets);
    const isLoading = useSelector(selectIsPresetLoading);
    const hasError = useSelector(selectHasPresetError);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchPresets(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Preset ID is required'));
        return dispatch(fetchPreset(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Preset data is required'));
        return dispatch(createPreset(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Preset ID is required'));
        if (!data) return Promise.reject(new Error('Preset data is required'));
        return dispatch(updatePreset({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Preset ID is required'));
        return dispatch(deletePreset(id)).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setPresetFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetPresetFilters());
    }, [dispatch]);

    const changePage = useCallback((newPage) => {
        dispatch(setPresetPagination({ page: newPage }));
    }, [dispatch]);

    const changePageSize = useCallback((newPageSize) => {
        dispatch(setPresetPagination({ pageSize: newPageSize, page: 1 }));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentPreset());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearPresetErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllPresets());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            if (Object.keys(initialFilters).length > 0) {
                dispatch(setPresetFilters(initialFilters));
            }
            if (page !== 1 || pageSize !== 20) {
                dispatch(setPresetPagination({ page, pageSize }));
            }
            fetchList();
        }
    }, [autoFetch, dispatch, fetchList, initialFilters, page, pageSize]);

    return useMemo(() => ({
        presets,
        currentPreset,
        defaultPreset,
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
        hasPresets,
        isLoading,
        hasError,
        fetchPresets: fetchList,
        fetchPreset: fetchOne,
        createPreset: create,
        updatePreset: update,
        deletePreset: remove,
        setFilters: updateFilters,
        resetFilters: resetAllFilters,
        setPage: changePage,
        setPageSize: changePageSize,
        clearCurrentPreset: clearCurrent,
        clearErrors,
        clearAllPresets: clearAll,
    }), [
        presets,
        currentPreset,
        defaultPreset,
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
        hasPresets,
        isLoading,
        hasError,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        updateFilters,
        resetAllFilters,
        changePage,
        changePageSize,
        clearCurrent,
        clearErrors,
        clearAll,
    ]);
};

export const usePreset = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const preset = useSelector((state) => selectPresetById(state, id));
    const currentPreset = useSelector(selectCurrentPreset);
    const loading = useSelector(selectPresetDetailsLoading);
    const submitting = useSelector(selectPresetSubmitting);
    const error = useSelector(selectPresetError);

    const fetchCurrent = useCallback(() => {
        if (!id) return Promise.reject(new Error('Preset ID is required'));
        return dispatch(fetchPreset(id)).unwrap();
    }, [dispatch, id]);

    const update = useCallback((data) => {
        if (!id) return Promise.reject(new Error('Preset ID is required'));
        return dispatch(updatePreset({ id, data })).unwrap();
    }, [dispatch, id]);

    const remove = useCallback(() => {
        if (!id) return Promise.reject(new Error('Preset ID is required'));
        return dispatch(deletePreset(id)).unwrap();
    }, [dispatch, id]);

    useEffect(() => {
        if (autoFetch && id && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchCurrent();
        }
    }, [autoFetch, id, fetchCurrent]);

    return useMemo(() => ({
        preset: preset || currentPreset,
        loading,
        submitting,
        error,
        fetchPreset: fetchCurrent,
        updatePreset: update,
        deletePreset: remove,
    }), [
        preset,
        currentPreset,
        loading,
        submitting,
        error,
        fetchCurrent,
        update,
        remove,
    ]);
};

export const usePresetById = (id) => {
    return useSelector((state) => selectPresetById(state, id));
};

export const usePresetsByReport = (reportId) => {
    return useSelector((state) => selectPresetsByReport(state, reportId));
};

export default usePresets;
