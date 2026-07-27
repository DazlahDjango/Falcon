// ============================================
// frontend/src/hooks/reports/useFilters.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFilters,
    fetchFilter,
    createFilter,
    updateFilter,
    deleteFilter,
    applyFilter,
    setDefaultFilter,
    duplicateFilter,
    fetchGlobalFilters,
    fetchMyFilters,
    fetchFilterTypes,
    clearCurrentFilter,
    clearFilterErrors,
    setFiltersState,
    resetFiltersState,
    setFilterPagination,
    clearAllFilters,
    clearAppliedFilters,
    setAppliedFilters,
} from '../../store/reports/slice/filter.slice';
import {
    selectFilters,
    selectCurrentFilter,
    selectGlobalFilters,
    selectMyFilters,
    selectFilterLoading,
    selectFilterDetailsLoading,
    selectFilterSubmitting,
    selectFilterError,
    selectFilterPagination,
    selectFilterPage,
    selectFilterPageSize,
    selectFilterTotal,
    selectFilterTotalPages,
    selectFilterFilters,
    selectFilterById,
    selectFiltersByType,
    selectSystemFilters,
    selectDefaultFilters,
    selectGlobalFiltersList,
    selectFilterCount,
    selectHasFilters,
    selectIsFilterLoading,
    selectHasFilterError,
    selectFilterTypes,
    selectAppliedFilters,
} from '../../store/reports/selectors/filter.selectors';

export const useFilters = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchGlobal = false,
        autoFetchMy = false,
        autoFetchTypes = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchGlobalCalled = useRef(false);
    const fetchMyCalled = useRef(false);
    const fetchTypesCalled = useRef(false);

    const filters = useSelector(selectFilters);
    const currentFilter = useSelector(selectCurrentFilter);
    const globalFilters = useSelector(selectGlobalFilters);
    const myFilters = useSelector(selectMyFilters);
    const loading = useSelector(selectFilterLoading);
    const loadingDetails = useSelector(selectFilterDetailsLoading);
    const submitting = useSelector(selectFilterSubmitting);
    const error = useSelector(selectFilterError);
    const pagination = useSelector(selectFilterPagination);
    const pageNum = useSelector(selectFilterPage);
    const pageSizeNum = useSelector(selectFilterPageSize);
    const total = useSelector(selectFilterTotal);
    const totalPages = useSelector(selectFilterTotalPages);
    const filtersState = useSelector(selectFilterFilters);
    const count = useSelector(selectFilterCount);
    const hasFilters = useSelector(selectHasFilters);
    const isLoading = useSelector(selectIsFilterLoading);
    const hasError = useSelector(selectHasFilterError);
    const types = useSelector(selectFilterTypes);
    const appliedFilters = useSelector(selectAppliedFilters);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filtersState,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchFilters(mergedParams)).unwrap();
    }, [dispatch, filtersState, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Filter ID is required'));
        return dispatch(fetchFilter(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Filter data is required'));
        return dispatch(createFilter(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Filter ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateFilter({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Filter ID is required'));
        return dispatch(deleteFilter(id)).unwrap();
    }, [dispatch]);

    const apply = useCallback((id, values) => {
        if (!id) return Promise.reject(new Error('Filter ID is required'));
        if (!values) return Promise.reject(new Error('Filter values are required'));
        return dispatch(applyFilter({ id, values })).unwrap();
    }, [dispatch]);

    const setDefault = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Filter ID is required'));
        return dispatch(setDefaultFilter(id)).unwrap();
    }, [dispatch]);

    const duplicate = useCallback((id, newName = null) => {
        if (!id) return Promise.reject(new Error('Filter ID is required'));
        return dispatch(duplicateFilter({ id, newName })).unwrap();
    }, [dispatch]);

    const fetchGlobal = useCallback(() => {
        return dispatch(fetchGlobalFilters()).unwrap();
    }, [dispatch]);

    const fetchMy = useCallback(() => {
        return dispatch(fetchMyFilters()).unwrap();
    }, [dispatch]);

    const fetchTypes = useCallback(() => {
        return dispatch(fetchFilterTypes()).unwrap();
    }, [dispatch]);

    const updateFiltersState = useCallback((newFilters) => {
        dispatch(setFiltersState(newFilters));
    }, [dispatch]);

    const resetAllFiltersState = useCallback(() => {
        dispatch(resetFiltersState());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setFilterPagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentFilter());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearFilterErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllFilters());
    }, [dispatch]);

    const clearApplied = useCallback(() => {
        dispatch(clearAppliedFilters());
    }, [dispatch]);

    const setApplied = useCallback((values) => {
        dispatch(setAppliedFilters(values));
    }, [dispatch]);

    const getById = useCallback((id) => {
        return useSelector((state) => selectFilterById(state, id));
    }, []);

    const getByType = useCallback((type) => {
        return useSelector((state) => selectFiltersByType(state, type));
    }, []);

    const getSystem = useCallback(() => {
        return useSelector(selectSystemFilters);
    }, []);

    const getDefault = useCallback(() => {
        return useSelector(selectDefaultFilters);
    }, []);

    const getGlobalList = useCallback(() => {
        return useSelector(selectGlobalFiltersList);
    }, []);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    useEffect(() => {
        if (autoFetchGlobal && !fetchGlobalCalled.current) {
            fetchGlobalCalled.current = true;
            fetchGlobal();
        }
    }, [autoFetchGlobal, fetchGlobal]);

    useEffect(() => {
        if (autoFetchMy && !fetchMyCalled.current) {
            fetchMyCalled.current = true;
            fetchMy();
        }
    }, [autoFetchMy, fetchMy]);

    useEffect(() => {
        if (autoFetchTypes && !fetchTypesCalled.current) {
            fetchTypesCalled.current = true;
            fetchTypes();
        }
    }, [autoFetchTypes, fetchTypes]);

    return useMemo(() => ({
        filters,
        currentFilter,
        globalFilters,
        myFilters,
        loading,
        loadingDetails,
        submitting,
        error,
        pagination,
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        filtersState,
        count,
        hasFilters,
        isLoading,
        hasError,
        types,
        appliedFilters,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        apply,
        setDefault,
        duplicate,
        fetchGlobal,
        fetchMy,
        fetchTypes,
        updateFiltersState,
        resetAllFiltersState,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        clearApplied,
        setApplied,
        getById,
        getByType,
        getSystem,
        getDefault,
        getGlobalList,
    }), [
        filters,
        currentFilter,
        globalFilters,
        myFilters,
        loading,
        loadingDetails,
        submitting,
        error,
        pagination,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        filtersState,
        count,
        hasFilters,
        isLoading,
        hasError,
        types,
        appliedFilters,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        apply,
        setDefault,
        duplicate,
        fetchGlobal,
        fetchMy,
        fetchTypes,
        updateFiltersState,
        resetAllFiltersState,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        clearApplied,
        setApplied,
        getById,
        getByType,
        getSystem,
        getDefault,
        getGlobalList,
    ]);
};