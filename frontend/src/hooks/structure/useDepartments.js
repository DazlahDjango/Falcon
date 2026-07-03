import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import {
    fetchDepartments,
    fetchDepartmentById,
    fetchRootDepartments,
    fetchDepartmentStats,
    fetchDepartmentChildren,
    fetchDepartmentSections,
    fetchDepartmentEmployments,
    fetchDepartmentAncestors,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    moveDepartment,
    clearDepartmentError,
    clearDepartmentCurrent,
    setDepartmentFilters,
    setDepartmentPagination,
    resetDepartmentState,
} from '../../store/structure/slice/departmentSlice';
import {
    selectDepartmentsItems,
    selectDepartmentsCurrent,
    selectDepartmentsRoot,
    selectDepartmentsStats,
    selectDepartmentsLoading,
    selectDepartmentsError,
    selectDepartmentsTotal,
} from '../../store/structure/selectors';

export const useDepartments = (options = {}) => {
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

    const items = useSelector(selectDepartmentsItems);
    const currentItem = useSelector(selectDepartmentsCurrent);
    const rootItems = useSelector(selectDepartmentsRoot);
    const stats = useSelector(selectDepartmentsStats);
    const isLoading = useSelector(selectDepartmentsLoading);
    const error = useSelector(selectDepartmentsError);
    const totalCount = useSelector(selectDepartmentsTotal);

    // Stable fetch function - memoized with params
    const fetchAll = useCallback((fetchParams) => {
        const paramsToUse = fetchParams || params;
        return dispatch(fetchDepartments(paramsToUse));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchDepartmentById(id));
    }, [dispatch]);

    const fetchRoot = useCallback(() => {
        return dispatch(fetchRootDepartments());
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchDepartmentStats());
    }, [dispatch]);

    const fetchChildren = useCallback((id) => {
        return dispatch(fetchDepartmentChildren(id));
    }, [dispatch]);

    const fetchSections = useCallback((id) => {
        return dispatch(fetchDepartmentSections(id));
    }, [dispatch]);

    const fetchEmployments = useCallback((id) => {
        return dispatch(fetchDepartmentEmployments(id));
    }, [dispatch]);

    const fetchAncestors = useCallback((id) => {
        return dispatch(fetchDepartmentAncestors(id));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createDepartment(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateDepartment({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteDepartment(id));
    }, [dispatch]);

    const move = useCallback((id, parentId) => {
        return dispatch(moveDepartment({ id, parentId }));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearDepartmentError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearDepartmentCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setDepartmentFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setDepartmentPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetDepartmentState());
    }, [dispatch]);

    const refetch = useCallback((newParams) => {
        const fetchParams = newParams || params;
        prevParamsRef.current = fetchParams;
        return dispatch(fetchDepartments(fetchParams));
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
            dispatch(fetchDepartments(params));
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
        return dispatch(fetchDepartments(params));
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
        fetchChildren,
        fetchSections,
        fetchEmployments,
        fetchAncestors,
        create,
        update,
        remove,
        move,
        clearError,
        clearCurrent,
        setFilters,
        setPagination,
        reset,
        refetch,
        forceFetch,
        // Expose the hasFetched state for debugging
        _hasFetched: hasFetched.current,
    };
};

export default useDepartments;