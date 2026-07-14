import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import {
    fetchEmployments,
    fetchEmploymentById,
    fetchCurrentEmployments,
    fetchEmploymentsByUser,
    fetchEmploymentStats,
    fetchMyEmployment,
    createEmployment,
    updateEmployment,
    deleteEmployment,
    transferEmployee,
    bulkCreateEmployments,
    clearEmploymentError,
    clearEmploymentCurrent,
    setEmploymentFilters,
    setEmploymentPagination,
    resetEmploymentState,
} from '../../store/structure/slice/employmentSlice';
import {
    selectEmploymentsItems,
    selectEmploymentsCurrent,
    selectEmploymentsCurrentList,
    selectEmploymentsStats,
    selectEmploymentsLoading,
    selectEmploymentsError,
    selectEmploymentsTotal,
} from '../../store/structure/selectors';

export const useEmployments = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params: initialParams = {} } = options;

    const isFirstRender = useRef(true);
    const hasFetched = useRef(false);
    const prevParamsRef = useRef(initialParams);

    const params = useMemo(() => initialParams, [
        JSON.stringify(initialParams)
    ]);

    const items = useSelector(selectEmploymentsItems);
    const currentItem = useSelector(selectEmploymentsCurrent);
    const currentEmployments = useSelector(selectEmploymentsCurrentList);
    const stats = useSelector(selectEmploymentsStats);
    const isLoading = useSelector(selectEmploymentsLoading);
    const error = useSelector(selectEmploymentsError);
    const totalCount = useSelector(selectEmploymentsTotal);

    const fetchAll = useCallback((fetchParams) => {
        const paramsToUse = fetchParams || params;
        return dispatch(fetchEmployments(paramsToUse));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchEmploymentById(id));
    }, [dispatch]);

    const fetchCurrent = useCallback((fetchParams) => {
        return dispatch(fetchCurrentEmployments(fetchParams));
    }, [dispatch]);

    const fetchByUser = useCallback((userId) => {
        return dispatch(fetchEmploymentsByUser(userId));
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchEmploymentStats());
    }, [dispatch]);

    const fetchMy = useCallback(() => {
        return dispatch(fetchMyEmployment());
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createEmployment(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateEmployment({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteEmployment(id));
    }, [dispatch]);

    const transfer = useCallback((data) => {
        return dispatch(transferEmployee(data));
    }, [dispatch]);

    const bulkCreate = useCallback((data) => {
        return dispatch(bulkCreateEmployments(data));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearEmploymentError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearEmploymentCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setEmploymentFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setEmploymentPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetEmploymentState());
    }, [dispatch]);

    const refetch = useCallback((newParams) => {
        const fetchParams = newParams || params;
        prevParamsRef.current = fetchParams;
        return dispatch(fetchEmployments(fetchParams));
    }, [dispatch, params]);

    useEffect(() => {
        if (!autoFetch) {
            return;
        }

        const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(params);
        
        if (!hasFetched.current || paramsChanged) {
            hasFetched.current = true;
            prevParamsRef.current = params;
            dispatch(fetchEmployments(params));
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
        return dispatch(fetchEmployments(params));
    }, [dispatch, params]);

    return {
        items,
        currentItem,
        currentEmployments,
        stats,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchCurrent,
        fetchByUser,
        fetchStats,
        fetchMy,
        create,
        update,
        remove,
        transfer,
        bulkCreate,
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

export default useEmployments;