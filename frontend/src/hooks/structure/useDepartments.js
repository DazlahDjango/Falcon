import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
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
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectDepartmentsItems);
    const currentItem = useSelector(selectDepartmentsCurrent);
    const rootItems = useSelector(selectDepartmentsRoot);
    const stats = useSelector(selectDepartmentsStats);
    const isLoading = useSelector(selectDepartmentsLoading);
    const error = useSelector(selectDepartmentsError);
    const totalCount = useSelector(selectDepartmentsTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchDepartments(fetchParams || params));
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

    useEffect(() => {
        if (autoFetch) {
            fetchAll(params);
        }
    }, [autoFetch, fetchAll, params]);

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
    };
};

export default useDepartments;