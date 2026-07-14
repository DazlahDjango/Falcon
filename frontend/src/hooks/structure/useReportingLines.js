import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import {
    fetchReportingLines,
    fetchReportingLineById,
    fetchReportingLinesByEmployee,
    fetchReportingLinesByManager,
    fetchReportingChain,
    fetchSpanOfControl,
    fetchOrganizationSpan,
    fetchMyChain,
    fetchMyTeam,
    createReportingLine,
    updateReportingLine,
    deleteReportingLine,
    assignManager,
    removeManager,
    clearReportingLineError,
    clearReportingLineCurrent,
    setReportingLineFilters,
    setReportingLinePagination,
    resetReportingLineState,
} from '../../store/structure/slice/reportingLineSlice';
import {
    selectReportingLinesItems,
    selectReportingLinesCurrent,
    selectMyChain,
    selectMyTeam,
    selectOrganizationSpan,
    selectReportingLinesLoading,
    selectReportingLinesError,
    selectReportingLinesTotal,
} from '../../store/structure/selectors';

export const useReportingLines = (options = {}) => {
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

    const items = useSelector(selectReportingLinesItems);
    const currentItem = useSelector(selectReportingLinesCurrent);
    const myChain = useSelector(selectMyChain);
    const myTeam = useSelector(selectMyTeam);
    const organizationSpan = useSelector(selectOrganizationSpan);
    const isLoading = useSelector(selectReportingLinesLoading);
    const error = useSelector(selectReportingLinesError);
    const totalCount = useSelector(selectReportingLinesTotal);

    // Stable fetch function - memoized with params
    const fetchAll = useCallback((fetchParams) => {
        const paramsToUse = fetchParams || params;
        return dispatch(fetchReportingLines(paramsToUse));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchReportingLineById(id));
    }, [dispatch]);

    const fetchByEmployee = useCallback((userId) => {
        return dispatch(fetchReportingLinesByEmployee(userId));
    }, [dispatch]);

    const fetchByManager = useCallback((userId) => {
        return dispatch(fetchReportingLinesByManager(userId));
    }, [dispatch]);

    const fetchChain = useCallback((userId) => {
        return dispatch(fetchReportingChain(userId));
    }, [dispatch]);

    const fetchSpan = useCallback((managerId) => {
        return dispatch(fetchSpanOfControl(managerId));
    }, [dispatch]);

    const fetchOrganizationSpanFn = useCallback(() => {
        return dispatch(fetchOrganizationSpan());
    }, [dispatch]);

    const fetchMyChainFn = useCallback(() => {
        return dispatch(fetchMyChain());
    }, [dispatch]);

    const fetchMyTeamFn = useCallback(() => {
        return dispatch(fetchMyTeam());
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createReportingLine(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateReportingLine({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteReportingLine(id));
    }, [dispatch]);

    const assign = useCallback((data) => {
        return dispatch(assignManager(data));
    }, [dispatch]);

    const removeManagerFn = useCallback((data) => {
        return dispatch(removeManager(data));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearReportingLineError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearReportingLineCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setReportingLineFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setReportingLinePagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetReportingLineState());
    }, [dispatch]);

    const refetch = useCallback((newParams) => {
        const fetchParams = newParams || params;
        prevParamsRef.current = fetchParams;
        return dispatch(fetchReportingLines(fetchParams));
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
            dispatch(fetchReportingLines(params));
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
        return dispatch(fetchReportingLines(params));
    }, [dispatch, params]);

    return {
        items,
        currentItem,
        myChain,
        myTeam,
        organizationSpan,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchByEmployee,
        fetchByManager,
        fetchChain,
        fetchSpan,
        fetchOrganizationSpan: fetchOrganizationSpanFn,
        fetchMyChain: fetchMyChainFn,
        fetchMyTeam: fetchMyTeamFn,
        create,
        update,
        remove,
        assign,
        removeManager: removeManagerFn,
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

export default useReportingLines;
