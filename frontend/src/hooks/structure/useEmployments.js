import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
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
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectEmploymentsItems);
    const currentItem = useSelector(selectEmploymentsCurrent);
    const currentEmployments = useSelector(selectEmploymentsCurrentList);
    const stats = useSelector(selectEmploymentsStats);
    const isLoading = useSelector(selectEmploymentsLoading);
    const error = useSelector(selectEmploymentsError);
    const totalCount = useSelector(selectEmploymentsTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchEmployments(fetchParams || params));
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

    useEffect(() => {
        if (autoFetch) {
            fetchAll(params);
        }
    }, [autoFetch, fetchAll, params]);

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
    };
};

export default useEmployments;