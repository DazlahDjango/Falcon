import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
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
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectReportingLinesItems);
    const currentItem = useSelector(selectReportingLinesCurrent);
    const myChain = useSelector(selectMyChain);
    const myTeam = useSelector(selectMyTeam);
    const organizationSpan = useSelector(selectOrganizationSpan);
    const isLoading = useSelector(selectReportingLinesLoading);
    const error = useSelector(selectReportingLinesError);
    const totalCount = useSelector(selectReportingLinesTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchReportingLines(fetchParams || params));
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

    const fetchOrganizationSpan = useCallback(() => {
        return dispatch(fetchOrganizationSpan());
    }, [dispatch]);

    const fetchMyChain = useCallback(() => {
        return dispatch(fetchMyChain());
    }, [dispatch]);

    const fetchMyTeam = useCallback(() => {
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

    const removeManager = useCallback((data) => {
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

    useEffect(() => {
        if (autoFetch) {
            fetchAll(params);
        }
    }, [autoFetch, fetchAll, params]);

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
        fetchOrganizationSpan,
        fetchMyChain,
        fetchMyTeam,
        create,
        update,
        remove,
        assign,
        removeManager,
        clearError,
        clearCurrent,
        setFilters,
        setPagination,
        reset,
    };
};

export default useReportingLines;