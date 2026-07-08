import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
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
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectUnitsItems);
    const currentItem = useSelector(selectUnitsCurrent);
    const stats = useSelector(selectUnitsStats);
    const isLoading = useSelector(selectUnitsLoading);
    const error = useSelector(selectUnitsError);
    const totalCount = useSelector(selectUnitsTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchUnits(fetchParams || params));
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

    useEffect(() => {
        if (autoFetch) {
            fetchAll(params);
        }
    }, [autoFetch, fetchAll, params]);

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
    };
};

export default useUnits;