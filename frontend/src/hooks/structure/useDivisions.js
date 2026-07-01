import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchDivisions,
    fetchDivisionById,
    fetchDivisionStats,
    fetchDivisionDepartments,
    createDivision,
    updateDivision,
    deleteDivision,
    clearDivisionError,
    clearDivisionCurrent,
    setDivisionFilters,
    setDivisionPagination,
    resetDivisionState,
} from '../../store/structure/slice/divisionslice';
import {
    selectDivisionsItems,
    selectDivisionsCurrent,
    selectDivisionsStats,
    selectDivisionsLoading,
    selectDivisionsError,
    selectDivisionsTotal,
} from '../../store/structure/selectors';

export const useDivisions = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectDivisionsItems);
    const currentItem = useSelector(selectDivisionsCurrent);
    const stats = useSelector(selectDivisionsStats);
    const isLoading = useSelector(selectDivisionsLoading);
    const error = useSelector(selectDivisionsError);
    const totalCount = useSelector(selectDivisionsTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchDivisions(fetchParams || params));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchDivisionById(id));
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchDivisionStats());
    }, [dispatch]);

    const fetchDepartments = useCallback((id) => {
        return dispatch(fetchDivisionDepartments(id));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createDivision(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateDivision({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteDivision(id));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearDivisionError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearDivisionCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setDivisionFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setDivisionPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetDivisionState());
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
        fetchDepartments,
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

export default useDivisions;