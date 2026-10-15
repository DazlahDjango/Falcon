// ============================================
// frontend/src/hooks/reports/useDistributions.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDistributions,
    fetchDistribution,
    createDistribution,
    updateDistribution,
    deleteDistribution,
    clearCurrentDistribution,
    clearDistributionErrors,
    setDistributionFilters,
    resetDistributionFilters,
    setDistributionPagination,
    clearAllDistributions,
} from '../../store/reports/slice/distribution.slice';
import {
    selectDistributions,
    selectCurrentDistribution,
    selectDistributionLoading,
    selectDistributionDetailsLoading,
    selectDistributionSubmitting,
    selectDistributionError,
    selectDistributionPagination,
    selectDistributionPage,
    selectDistributionPageSize,
    selectDistributionTotal,
    selectDistributionTotalPages,
    selectDistributionFilters,
    selectDistributionById,
    selectActiveDistributions,
    selectDistributionCount,
    selectHasDistributions,
    selectIsDistributionLoading,
    selectHasDistributionError,
} from '../../store/reports/selectors/distribution.selectors';

export const useDistributions = (options = {}) => {
    const {
        autoFetch = true,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const distributions = useSelector(selectDistributions);
    const currentDistribution = useSelector(selectCurrentDistribution);
    const loading = useSelector(selectDistributionLoading);
    const loadingDetails = useSelector(selectDistributionDetailsLoading);
    const submitting = useSelector(selectDistributionSubmitting);
    const error = useSelector(selectDistributionError);
    const pagination = useSelector(selectDistributionPagination);
    const pageNum = useSelector(selectDistributionPage);
    const pageSizeNum = useSelector(selectDistributionPageSize);
    const total = useSelector(selectDistributionTotal);
    const totalPages = useSelector(selectDistributionTotalPages);
    const filters = useSelector(selectDistributionFilters);
    const activeDistributions = useSelector(selectActiveDistributions);
    const count = useSelector(selectDistributionCount);
    const hasDistributions = useSelector(selectHasDistributions);
    const isLoading = useSelector(selectIsDistributionLoading);
    const hasError = useSelector(selectHasDistributionError);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchDistributions(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Distribution ID is required'));
        return dispatch(fetchDistribution(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Distribution data is required'));
        return dispatch(createDistribution(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Distribution ID is required'));
        if (!data) return Promise.reject(new Error('Distribution data is required'));
        return dispatch(updateDistribution({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Distribution ID is required'));
        return dispatch(deleteDistribution(id)).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setDistributionFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetDistributionFilters());
    }, [dispatch]);

    const changePage = useCallback((newPage) => {
        dispatch(setDistributionPagination({ page: newPage }));
    }, [dispatch]);

    const changePageSize = useCallback((newPageSize) => {
        dispatch(setDistributionPagination({ pageSize: newPageSize, page: 1 }));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentDistribution());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearDistributionErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllDistributions());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            if (Object.keys(initialFilters).length > 0) {
                dispatch(setDistributionFilters(initialFilters));
            }
            if (page !== 1 || pageSize !== 20) {
                dispatch(setDistributionPagination({ page, pageSize }));
            }
            fetchList();
        }
    }, [autoFetch, dispatch, fetchList, initialFilters, page, pageSize]);

    return useMemo(() => ({
        distributions,
        currentDistribution,
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
        activeDistributions,
        count,
        hasDistributions,
        isLoading,
        hasError,
        fetchDistributions: fetchList,
        fetchDistribution: fetchOne,
        createDistribution: create,
        updateDistribution: update,
        deleteDistribution: remove,
        setFilters: updateFilters,
        resetFilters: resetAllFilters,
        setPage: changePage,
        setPageSize: changePageSize,
        clearCurrentDistribution: clearCurrent,
        clearErrors,
        clearAllDistributions: clearAll,
    }), [
        distributions,
        currentDistribution,
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
        activeDistributions,
        count,
        hasDistributions,
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

export const useDistribution = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const distribution = useSelector((state) => selectDistributionById(state, id));
    const currentDistribution = useSelector(selectCurrentDistribution);
    const loading = useSelector(selectDistributionDetailsLoading);
    const submitting = useSelector(selectDistributionSubmitting);
    const error = useSelector(selectDistributionError);

    const fetchCurrent = useCallback(() => {
        if (!id) return Promise.reject(new Error('Distribution ID is required'));
        return dispatch(fetchDistribution(id)).unwrap();
    }, [dispatch, id]);

    const update = useCallback((data) => {
        if (!id) return Promise.reject(new Error('Distribution ID is required'));
        return dispatch(updateDistribution({ id, data })).unwrap();
    }, [dispatch, id]);

    const remove = useCallback(() => {
        if (!id) return Promise.reject(new Error('Distribution ID is required'));
        return dispatch(deleteDistribution(id)).unwrap();
    }, [dispatch, id]);

    useEffect(() => {
        if (autoFetch && id && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchCurrent();
        }
    }, [autoFetch, id, fetchCurrent]);

    return useMemo(() => ({
        distribution: distribution || currentDistribution,
        loading,
        submitting,
        error,
        fetchDistribution: fetchCurrent,
        updateDistribution: update,
        deleteDistribution: remove,
    }), [
        distribution,
        currentDistribution,
        loading,
        submitting,
        error,
        fetchCurrent,
        update,
        remove,
    ]);
};

export const useDistributionById = (id) => {
    return useSelector((state) => selectDistributionById(state, id));
};

export default useDistributions;
