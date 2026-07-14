import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import {
    fetchCostCenters,
    fetchCostCenterById,
    fetchCostCenterStats,
    fetchCostCenterChildren,
    fetchCostCenterUtilization,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
    clearCostCenterError,
    clearCostCenterCurrent,
    setCostCenterFilters,
    setCostCenterPagination,
    resetCostCenterState,
} from '../../store/structure/slice/costCenterSlice';
import {
    selectCostCentersItems,
    selectCostCentersCurrent,
    selectCostCentersStats,
    selectCostCentersLoading,
    selectCostCentersError,
    selectCostCentersTotal,
} from '../../store/structure/selectors';

export const useCostCenters = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params: initialParams = {} } = options;

    const isFirstRender = useRef(true);
    const hasFetched = useRef(false);
    const prevParamsRef = useRef(initialParams);

    const params = useMemo(() => initialParams, [
        JSON.stringify(initialParams)
    ]);

    const items = useSelector(selectCostCentersItems);
    const currentItem = useSelector(selectCostCentersCurrent);
    const stats = useSelector(selectCostCentersStats);
    const isLoading = useSelector(selectCostCentersLoading);
    const error = useSelector(selectCostCentersError);
    const totalCount = useSelector(selectCostCentersTotal);

    const fetchAll = useCallback((fetchParams) => {
        const paramsToUse = fetchParams || params;
        return dispatch(fetchCostCenters(paramsToUse));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchCostCenterById(id));
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchCostCenterStats());
    }, [dispatch]);

    const fetchChildren = useCallback((id) => {
        return dispatch(fetchCostCenterChildren(id));
    }, [dispatch]);

    const fetchUtilization = useCallback((id) => {
        return dispatch(fetchCostCenterUtilization(id));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createCostCenter(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateCostCenter({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteCostCenter(id));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearCostCenterError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCostCenterCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setCostCenterFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setCostCenterPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetCostCenterState());
    }, [dispatch]);

    useEffect(() => {
        if (!autoFetch) {
            return;
        }
        
        const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(params);
        
        if (!hasFetched.current || paramsChanged) {
            hasFetched.current = true;
            prevParamsRef.current = params;
            dispatch(fetchCostCenters(params));
        }
    }, [autoFetch, params, dispatch]);

    return {
        items,
        currentItem,
        stats,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchStats,
        fetchChildren,
        fetchUtilization,
        create,
        update,
        remove,
        clearError,
        clearCurrent,
        setFilters,
        setPagination,
        reset,
    };
};

export default useCostCenters;