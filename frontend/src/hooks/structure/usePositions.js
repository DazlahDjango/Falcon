import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchPositions,
    fetchPositionById,
    fetchVacantPositions,
    fetchPositionStats,
    fetchPositionIncumbents,
    fetchPositionReportingChain,
    createPosition,
    updatePosition,
    deletePosition,
    clearPositionError,
    clearPositionCurrent,
    setPositionFilters,
    setPositionPagination,
    resetPositionState,
} from '../../store/structure/slice/positionSlice';
import {
    selectPositionsItems,
    selectPositionsCurrent,
    selectPositionsVacant,
    selectPositionsStats,
    selectPositionsLoading,
    selectPositionsError,
    selectPositionsTotal,
} from '../../store/structure/selectors';

export const usePositions = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectPositionsItems);
    const currentItem = useSelector(selectPositionsCurrent);
    const vacantItems = useSelector(selectPositionsVacant);
    const stats = useSelector(selectPositionsStats);
    const isLoading = useSelector(selectPositionsLoading);
    const error = useSelector(selectPositionsError);
    const totalCount = useSelector(selectPositionsTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchPositions(fetchParams || params));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchPositionById(id));
    }, [dispatch]);

    const fetchVacant = useCallback(() => {
        return dispatch(fetchVacantPositions());
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchPositionStats());
    }, [dispatch]);

    const fetchIncumbents = useCallback((id) => {
        return dispatch(fetchPositionIncumbents(id));
    }, [dispatch]);

    const fetchReportingChain = useCallback((id) => {
        return dispatch(fetchPositionReportingChain(id));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createPosition(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updatePosition({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deletePosition(id));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearPositionError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearPositionCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setPositionFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setPositionPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetPositionState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll(params);
        }
    }, [autoFetch, fetchAll, params]);

    return {
        items,
        currentItem,
        vacantItems,
        stats,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchVacant,
        fetchStats,
        fetchIncumbents,
        fetchReportingChain,
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

export default usePositions;