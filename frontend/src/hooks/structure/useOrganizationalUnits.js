import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import {
    fetchOrganizationalUnits,
    fetchOrganizationalUnitById,
    fetchRootOrganizationalUnits,
    fetchOrganizationalUnitStats,
    fetchOrganizationalUnitsByLevel,
    createOrganizationalUnit,
    updateOrganizationalUnit,
    deleteOrganizationalUnit,
    clearOrganizationalUnitError,
    clearOrganizationalUnitCurrent,
    setOrganizationalUnitFilters,
    setOrganizationalUnitPagination,
    resetOrganizationalUnitState,
} from '../../store/structure/slice/organizationalUnit.slice';
import {
    selectOrganizationalUnitsItems,
    selectOrganizationalUnitsCurrent,
    selectOrganizationalUnitsRoot,
    selectOrganizationalUnitsStats,
    selectOrganizationalUnitsLoading,
    selectOrganizationalUnitsError,
    selectOrganizationalUnitsTotal,
} from '../../store/structure/selectors';

export const useOrganizationalUnits = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params: initialParams = {} } = options;

    const isFirstRender = useRef(true);
    const hasFetched = useRef(false);
    const prevParamsRef = useRef(initialParams);

    const params = useMemo(() => initialParams, [
        JSON.stringify(initialParams)
    ]);

    const items = useSelector(selectOrganizationalUnitsItems);
    const currentItem = useSelector(selectOrganizationalUnitsCurrent);
    const rootItems = useSelector(selectOrganizationalUnitsRoot);
    const stats = useSelector(selectOrganizationalUnitsStats);
    const isLoading = useSelector(selectOrganizationalUnitsLoading);
    const error = useSelector(selectOrganizationalUnitsError);
    const totalCount = useSelector(selectOrganizationalUnitsTotal);

    const fetchAll = useCallback((fetchParams) => {
        const paramsToUse = fetchParams || params;
        return dispatch(fetchOrganizationalUnits(paramsToUse));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchOrganizationalUnitById(id));
    }, [dispatch]);

    const fetchRoot = useCallback(() => {
        return dispatch(fetchRootOrganizationalUnits());
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchOrganizationalUnitStats());
    }, [dispatch]);

    const fetchByLevel = useCallback((level) => {
        return dispatch(fetchOrganizationalUnitsByLevel(level));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createOrganizationalUnit(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateOrganizationalUnit({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteOrganizationalUnit(id));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearOrganizationalUnitError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearOrganizationalUnitCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setOrganizationalUnitFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setOrganizationalUnitPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetOrganizationalUnitState());
    }, [dispatch]);

    const refetch = useCallback((newParams) => {
        const fetchParams = newParams || params;
        prevParamsRef.current = fetchParams;
        return dispatch(fetchOrganizationalUnits(fetchParams));
    }, [dispatch, params]);

    useEffect(() => {
        if (!autoFetch) {
            return;
        }

        const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(params);
        
        if (!hasFetched.current || paramsChanged) {
            hasFetched.current = true;
            prevParamsRef.current = params;
            dispatch(fetchOrganizationalUnits(params));
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
        return dispatch(fetchOrganizationalUnits(params));
    }, [dispatch, params]);

    return {
        items,
        currentItem,
        rootItems,
        stats,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchRoot,
        fetchStats,
        fetchByLevel,
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

export default useOrganizationalUnits;