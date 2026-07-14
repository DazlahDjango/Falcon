import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import {
    fetchUnits,
    fetchUnitById,
    fetchUnitStats,
    fetchUnitEmployments,
    createUnit,
    updateUnit,
    deleteUnit,
    clearUnitError,
    clearUnitCurrent,
    setUnitFilters,
    setUnitPagination,
    resetUnitState,
} from '../../store/structure/slice/unitslice';
import {
    selectUnitsItems,
    selectUnitsCurrent,
    selectUnitsStats,
    selectUnitsLoading,
    selectUnitsError,
    selectUnitsTotal,
} from '../../store/structure/selectors';

export const useUnits = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params: initialParams = {} } = options;

    const isFirstRender = useRef(true);
    const hasFetched = useRef(false);
    const prevParamsRef = useRef(initialParams);

    const params = useMemo(() => initialParams, [
        JSON.stringify(initialParams)
    ]);

    const items = useSelector(selectUnitsItems);
    const currentItem = useSelector(selectUnitsCurrent);
    const stats = useSelector(selectUnitsStats);
    const isLoading = useSelector(selectUnitsLoading);
    const error = useSelector(selectUnitsError);
    const totalCount = useSelector(selectUnitsTotal);

    const fetchAll = useCallback((fetchParams) => {
        const paramsToUse = fetchParams || params;
        return dispatch(fetchUnits(paramsToUse));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchUnitById(id));
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchUnitStats());
    }, [dispatch]);

    const fetchEmployments = useCallback((id) => {
        return dispatch(fetchUnitEmployments(id));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createUnit(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateUnit({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteUnit(id));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearUnitError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearUnitCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setUnitFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setUnitPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetUnitState());
    }, [dispatch]);

    const refetch = useCallback((newParams) => {
        const fetchParams = newParams || params;
        prevParamsRef.current = fetchParams;
        return dispatch(fetchUnits(fetchParams));
    }, [dispatch, params]);

    useEffect(() => {
        if (!autoFetch) {
            return;
        }

        const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(params);
        
        if (!hasFetched.current || paramsChanged) {
            hasFetched.current = true;
            prevParamsRef.current = params;
            dispatch(fetchUnits(params));
        }
    }, [autoFetch, params, dispatch]);

    useEffect(() => {
        return () => {
            hasFetched.current = false;
            isFirstRender.current = true;
        };
    }, []);

    const forceFetch = useCallback(() => {
        hasFetched.current = true;
        return dispatch(fetchUnits(params));
    }, [dispatch, params]);

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
        fetchEmployments,
        create,
        update,
        remove,
        clearError,
        clearCurrent,
        setFilters,
        setPagination,
        reset,
        refetch,
        forceFetch,
        _hasFetched: hasFetched.current,
    };
};

export default useUnits;