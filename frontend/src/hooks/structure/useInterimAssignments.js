import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchInterimAssignments,
    fetchInterimAssignmentById,
    fetchActiveInterimAssignments,
    fetchExpiringInterimAssignments,
    fetchInterimAssignmentsByEmployee,
    createInterimAssignment,
    updateInterimAssignment,
    deleteInterimAssignment,
    assignInterim,
    endInterim,
    clearInterimAssignmentError,
    clearInterimAssignmentCurrent,
    setInterimAssignmentFilters,
    setInterimAssignmentPagination,
    resetInterimAssignmentState,
} from '../../store/structure/slice/interimAssignment.slice';
import {
    selectInterimAssignmentsItems,
    selectInterimAssignmentsCurrent,
    selectInterimAssignmentsActive,
    selectInterimAssignmentsExpiring,
    selectInterimAssignmentsLoading,
    selectInterimAssignmentsError,
    selectInterimAssignmentsTotal,
} from '../../store/structure/selectors';

export const useInterimAssignments = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectInterimAssignmentsItems);
    const currentItem = useSelector(selectInterimAssignmentsCurrent);
    const activeItems = useSelector(selectInterimAssignmentsActive);
    const expiringItems = useSelector(selectInterimAssignmentsExpiring);
    const isLoading = useSelector(selectInterimAssignmentsLoading);
    const error = useSelector(selectInterimAssignmentsError);
    const totalCount = useSelector(selectInterimAssignmentsTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchInterimAssignments(fetchParams || params));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchInterimAssignmentById(id));
    }, [dispatch]);

    const fetchActive = useCallback(() => {
        return dispatch(fetchActiveInterimAssignments());
    }, [dispatch]);

    const fetchExpiring = useCallback((days) => {
        return dispatch(fetchExpiringInterimAssignments(days));
    }, [dispatch]);

    const fetchByEmployee = useCallback((userId) => {
        return dispatch(fetchInterimAssignmentsByEmployee(userId));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createInterimAssignment(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateInterimAssignment({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteInterimAssignment(id));
    }, [dispatch]);

    const assign = useCallback((data) => {
        return dispatch(assignInterim(data));
    }, [dispatch]);

    const end = useCallback((data) => {
        return dispatch(endInterim(data));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearInterimAssignmentError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearInterimAssignmentCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setInterimAssignmentFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setInterimAssignmentPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetInterimAssignmentState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll(params);
        }
    }, [autoFetch, fetchAll, params]);

    return {
        items,
        currentItem,
        activeItems,
        expiringItems,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchActive,
        fetchExpiring,
        fetchByEmployee,
        create,
        update,
        remove,
        assign,
        end,
        clearError,
        clearCurrent,
        setFilters,
        setPagination,
        reset,
    };
};

export default useInterimAssignments;