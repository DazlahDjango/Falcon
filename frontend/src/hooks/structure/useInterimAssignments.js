import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
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
    const { autoFetch = true, params: initialParams = {} } = options;
    
    // Use a ref to track the first render
    const isFirstRender = useRef(true);
    const hasFetched = useRef(false);
    const prevParamsRef = useRef(initialParams);
    
    // Memoize params to prevent unnecessary re-renders
    const params = useMemo(() => initialParams, [
        JSON.stringify(initialParams)
    ]);

    const items = useSelector(selectInterimAssignmentsItems);
    const currentItem = useSelector(selectInterimAssignmentsCurrent);
    const activeItems = useSelector(selectInterimAssignmentsActive);
    const expiringItems = useSelector(selectInterimAssignmentsExpiring);
    const isLoading = useSelector(selectInterimAssignmentsLoading);
    const error = useSelector(selectInterimAssignmentsError);
    const totalCount = useSelector(selectInterimAssignmentsTotal);

    // Stable fetch function - memoized with params
    const fetchAll = useCallback((fetchParams) => {
        const paramsToUse = fetchParams || params;
        return dispatch(fetchInterimAssignments(paramsToUse));
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
        return dispatch(setInterimAssignmentFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        return dispatch(setInterimAssignmentPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        return dispatch(resetInterimAssignmentState());
    }, [dispatch]);

    const refetch = useCallback((newParams) => {
        const fetchParams = newParams || params;
        prevParamsRef.current = fetchParams;
        return dispatch(fetchInterimAssignments(fetchParams));
    }, [dispatch, params]);

    // Auto-fetch on mount and when params change
    useEffect(() => {
        // Skip auto-fetch if disabled
        if (!autoFetch) {
            return;
        }

        // Check if params have changed
        const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(params);
        
        if (!hasFetched.current || paramsChanged) {
            hasFetched.current = true;
            prevParamsRef.current = params;
            dispatch(fetchInterimAssignments(params));
        }
    }, [autoFetch, params, dispatch]);

    // Reset hasFetched when component unmounts
    useEffect(() => {
        return () => {
            hasFetched.current = false;
            isFirstRender.current = true;
        };
    }, []);

    // Helper to force a fresh fetch with current params
    const forceFetch = useCallback(() => {
        hasFetched.current = true;
        return dispatch(fetchInterimAssignments(params));
    }, [dispatch, params]);

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
        refetch,
        forceFetch,
        _hasFetched: hasFetched.current,
    };
};

export default useInterimAssignments;
