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

// Standalone Selector Hooks (Top-Level Component Use)
export const useFilterById = (id) => useSelector((state) => selectFilterById(state, id));
export const useFiltersByType = (type) => useSelector((state) => selectFiltersByType(state, type));
export const useSystemFilters = () => useSelector(selectSystemFilters);
export const useDefaultFilters = () => useSelector(selectDefaultFilters);
export const useGlobalFiltersList = () => useSelector(selectGlobalFiltersList);

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

    const getById = useCallback((id) => filters.find(f => f.id === id), [filters]);
    const getByType = useCallback((type) => filters.filter(f => f.filter_type === type), [filters]);
    const getSystem = useCallback(() => filters.filter(f => f.is_system), [filters]);
    const getDefault = useCallback(() => filters.filter(f => f.is_default), [filters]);

    const getGlobalList = useCallback(() => globalFilters, [globalFilters]);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, fetchList, initialFilters]);

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
        createFilter: create,
        update,
        updateFilter: update,
        remove,
        deleteFilter: remove,
        apply,
        applyFilter: apply,
        setDefault,
        setDefaultFilter: setDefault,
        duplicate,
        duplicateFilter: duplicate,
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

export const useFilter = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const filter = useSelector((state) => selectFilterById(state, id));
    const currentFilter = useSelector(selectCurrentFilter);
    const loading = useSelector(selectFilterDetailsLoading);
    const error = useSelector(selectFilterError);

    const fetchOne = useCallback((filterId) => {
        const targetId = filterId || id;
        if (!targetId) return Promise.reject(new Error('Filter ID is required'));
        return dispatch(fetchFilter(targetId)).unwrap();
    }, [dispatch, id]);

    const updateOne = useCallback((targetIdOrData, data) => {
        let targetId = id;
        let updateData = targetIdOrData;
        if (data !== undefined) {
            targetId = targetIdOrData;
            updateData = data;
        }
        if (!targetId) return Promise.reject(new Error('Filter ID is required'));
        if (!updateData) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateFilter({ id: targetId, data: updateData })).unwrap();
    }, [dispatch, id]);

    const removeOne = useCallback((targetId) => {
        const finalId = targetId || id;
        if (!finalId) return Promise.reject(new Error('Filter ID is required'));
        return dispatch(deleteFilter(finalId)).unwrap();
    }, [dispatch, id]);

    const applyOne = useCallback((targetIdOrValues, values) => {
        let targetId = id;
        let applyValues = targetIdOrValues;
        if (values !== undefined) {
            targetId = targetIdOrValues;
            applyValues = values;
        }
        if (!targetId) return Promise.reject(new Error('Filter ID is required'));
        if (!applyValues) return Promise.reject(new Error('Filter values are required'));
        return dispatch(applyFilter({ id: targetId, values: applyValues })).unwrap();
    }, [dispatch, id]);

    const setDefaultOne = useCallback((targetId) => {
        const finalId = targetId || id;
        if (!finalId) return Promise.reject(new Error('Filter ID is required'));
        return dispatch(setDefaultFilter(finalId)).unwrap();
    }, [dispatch, id]);

    const duplicateOne = useCallback((targetIdOrData, newName) => {
        let targetId = id;
        let duplicateData = targetIdOrData;
        if (typeof targetIdOrData === 'string' || typeof targetIdOrData === 'number') {
            targetId = targetIdOrData;
            duplicateData = newName;
        }
        if (!targetId) return Promise.reject(new Error('Filter ID is required'));
        return dispatch(duplicateFilter({ id: targetId, newName: duplicateData })).unwrap();
    }, [dispatch, id]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentFilter());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearFilterErrors());
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

    const resolvedFilter = useMemo(() => {
        if (currentFilter && currentFilter.id === id) return currentFilter;
        return filter || currentFilter;
    }, [currentFilter, filter, id]);

    return useMemo(() => ({
        filter: resolvedFilter,
        loading,
        error,
        fetchOne,
        update: updateOne,
        updateFilter: updateOne,
        remove: removeOne,
        deleteFilter: removeOne,
        apply: applyOne,
        applyFilter: applyOne,
        setDefault: setDefaultOne,
        setDefaultFilter: setDefaultOne,
        duplicate: duplicateOne,
        duplicateFilter: duplicateOne,
        clearCurrent,
        clearErrors,
    }), [
        resolvedFilter,
        loading,
        error,
        fetchOne,
        updateOne,
        removeOne,
        applyOne,
        setDefaultOne,
        duplicateOne,
        clearCurrent,
        clearErrors,
    ]);
};