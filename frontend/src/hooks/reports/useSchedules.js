// ============================================
// frontend/src/hooks/reports/useSchedules.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSchedules,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    performScheduleAction,
    fetchScheduleHistory,
    fetchUpcomingRuns,
    fetchDueSchedules,
    fetchOverdueSchedules,
    fetchFrequencies,
    clearCurrentSchedule,
    clearScheduleErrors,
    setScheduleFilters,
    resetScheduleFilters,
    setSchedulePagination,
    clearAllSchedules,
} from '../../store/reports/slice/schedule.slice';
import {
    selectSchedules,
    selectCurrentSchedule,
    selectDueSchedules,
    selectOverdueSchedules,
    selectScheduleLoading,
    selectScheduleDetailsLoading,
    selectScheduleSubmitting,
    selectScheduleError,
    selectSchedulePagination,
    selectSchedulePage,
    selectSchedulePageSize,
    selectScheduleTotal,
    selectScheduleTotalPages,
    selectScheduleFilters,
    selectScheduleById,
    selectSchedulesByFrequency,
    selectSchedulesByStatus,
    selectActiveSchedules,
    selectPausedSchedules,
    selectScheduleCount,
    selectHasSchedules,
    selectIsScheduleLoading,
    selectHasScheduleError,
    selectScheduleFrequencies,
    selectScheduleHistory,
    selectUpcomingRuns,
} from '../../store/reports/selectors/schedule.selectors';

export const useSchedules = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchDue = false,
        autoFetchOverdue = false,
        autoFetchFrequencies = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchDueCalled = useRef(false);
    const fetchOverdueCalled = useRef(false);
    const fetchFrequenciesCalled = useRef(false);

    const schedules = useSelector(selectSchedules);
    const currentSchedule = useSelector(selectCurrentSchedule);
    const dueSchedules = useSelector(selectDueSchedules);
    const overdueSchedules = useSelector(selectOverdueSchedules);
    const loading = useSelector(selectScheduleLoading);
    const loadingDetails = useSelector(selectScheduleDetailsLoading);
    const submitting = useSelector(selectScheduleSubmitting);
    const error = useSelector(selectScheduleError);
    const pagination = useSelector(selectSchedulePagination);
    const pageNum = useSelector(selectSchedulePage);
    const pageSizeNum = useSelector(selectSchedulePageSize);
    const total = useSelector(selectScheduleTotal);
    const totalPages = useSelector(selectScheduleTotalPages);
    const filters = useSelector(selectScheduleFilters);
    const count = useSelector(selectScheduleCount);
    const hasSchedules = useSelector(selectHasSchedules);
    const isLoading = useSelector(selectIsScheduleLoading);
    const hasError = useSelector(selectHasScheduleError);
    const frequencies = useSelector(selectScheduleFrequencies);
    const history = useSelector(selectScheduleHistory);
    const upcomingRuns = useSelector(selectUpcomingRuns);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchSchedules(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Schedule ID is required'));
        return dispatch(fetchSchedule(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Schedule data is required'));
        return dispatch(createSchedule(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Schedule ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateSchedule({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Schedule ID is required'));
        return dispatch(deleteSchedule(id)).unwrap();
    }, [dispatch]);

    const performAction = useCallback((id, action) => {
        if (!id) return Promise.reject(new Error('Schedule ID is required'));
        if (!action) return Promise.reject(new Error('Action is required'));
        return dispatch(performScheduleAction({ id, action })).unwrap();
    }, [dispatch]);

    const fetchHistory = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Schedule ID is required'));
        return dispatch(fetchScheduleHistory(id)).unwrap();
    }, [dispatch]);

    const fetchUpcoming = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Schedule ID is required'));
        return dispatch(fetchUpcomingRuns(id)).unwrap();
    }, [dispatch]);

    const fetchDue = useCallback(() => {
        return dispatch(fetchDueSchedules()).unwrap();
    }, [dispatch]);

    const fetchOverdue = useCallback(() => {
        return dispatch(fetchOverdueSchedules()).unwrap();
    }, [dispatch]);

    const fetchFrequenciesList = useCallback(() => {
        return dispatch(fetchFrequencies()).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setScheduleFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetScheduleFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setSchedulePagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentSchedule());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearScheduleErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllSchedules());
    }, [dispatch]);

    const getById = useCallback((id) => {
        return useSelector((state) => selectScheduleById(state, id));
    }, []);

    const getByFrequency = useCallback((frequency) => {
        return useSelector((state) => selectSchedulesByFrequency(state, frequency));
    }, []);

    const getByStatus = useCallback((status) => {
        return useSelector((state) => selectSchedulesByStatus(state, status));
    }, []);

    const getActive = useCallback(() => {
        return useSelector(selectActiveSchedules);
    }, []);

    const getPaused = useCallback(() => {
        return useSelector(selectPausedSchedules);
    }, []);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    useEffect(() => {
        if (autoFetchDue && !fetchDueCalled.current) {
            fetchDueCalled.current = true;
            fetchDue();
        }
    }, [autoFetchDue, fetchDue]);

    useEffect(() => {
        if (autoFetchOverdue && !fetchOverdueCalled.current) {
            fetchOverdueCalled.current = true;
            fetchOverdue();
        }
    }, [autoFetchOverdue, fetchOverdue]);

    useEffect(() => {
        if (autoFetchFrequencies && !fetchFrequenciesCalled.current) {
            fetchFrequenciesCalled.current = true;
            fetchFrequenciesList();
        }
    }, [autoFetchFrequencies, fetchFrequenciesList]);

    return useMemo(() => ({
        schedules,
        currentSchedule,
        dueSchedules,
        overdueSchedules,
        loading,
        loadingDetails,
        submitting,
        error,
        pagination,
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasSchedules,
        isLoading,
        hasError,
        frequencies,
        history,
        upcomingRuns,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        performAction,
        fetchHistory,
        fetchUpcoming,
        fetchDue,
        fetchOverdue,
        fetchFrequenciesList,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        getById,
        getByFrequency,
        getByStatus,
        getActive,
        getPaused,
    }), [
        schedules,
        currentSchedule,
        dueSchedules,
        overdueSchedules,
        loading,
        loadingDetails,
        submitting,
        error,
        pagination,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasSchedules,
        isLoading,
        hasError,
        frequencies,
        history,
        upcomingRuns,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        performAction,
        fetchHistory,
        fetchUpcoming,
        fetchDue,
        fetchOverdue,
        fetchFrequenciesList,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        getById,
        getByFrequency,
        getByStatus,
        getActive,
        getPaused,
    ]);
};

export const useSchedule = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const schedule = useSelector((state) => selectScheduleById(state, id));
    const currentSchedule = useSelector(selectCurrentSchedule);
    const loading = useSelector(selectScheduleDetailsLoading);
    const error = useSelector(selectScheduleError);
    const history = useSelector(selectScheduleHistory);
    const upcomingRuns = useSelector(selectUpcomingRuns);

    const fetchOne = useCallback((scheduleId) => {
        if (!scheduleId) return Promise.reject(new Error('Schedule ID is required'));
        return dispatch(fetchSchedule(scheduleId)).unwrap();
    }, [dispatch]);

    const updateOne = useCallback((scheduleId, data) => {
        if (!scheduleId) return Promise.reject(new Error('Schedule ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateSchedule({ id: scheduleId, data })).unwrap();
    }, [dispatch]);

    const removeOne = useCallback((scheduleId) => {
        if (!scheduleId) return Promise.reject(new Error('Schedule ID is required'));
        return dispatch(deleteSchedule(scheduleId)).unwrap();
    }, [dispatch]);

    const performActionOne = useCallback((scheduleId, action) => {
        if (!scheduleId) return Promise.reject(new Error('Schedule ID is required'));
        if (!action) return Promise.reject(new Error('Action is required'));
        return dispatch(performScheduleAction({ id: scheduleId, action })).unwrap();
    }, [dispatch]);

    const fetchHistory = useCallback((scheduleId) => {
        if (!scheduleId) return Promise.reject(new Error('Schedule ID is required'));
        return dispatch(fetchScheduleHistory(scheduleId)).unwrap();
    }, [dispatch]);

    const fetchUpcoming = useCallback((scheduleId) => {
        if (!scheduleId) return Promise.reject(new Error('Schedule ID is required'));
        return dispatch(fetchUpcomingRuns(scheduleId)).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentSchedule());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearScheduleErrors());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch && id && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchOne(id);
        }
        return () => {
            clearCurrent();
        };
    }, [autoFetch, id, fetchOne, clearCurrent]);

    const resolvedSchedule = useMemo(() => {
        if (currentSchedule && currentSchedule.id === id) return currentSchedule;
        return schedule || currentSchedule;
    }, [currentSchedule, schedule, id]);

    return useMemo(() => ({
        schedule: resolvedSchedule,
        loading,
        error,
        history,
        upcomingRuns,
        fetchOne,
        update: updateOne,
        remove: removeOne,
        performAction: performActionOne,
        fetchHistory,
        fetchUpcoming,
        clearCurrent,
        clearErrors,
    }), [
        resolvedSchedule,
        loading,
        error,
        history,
        upcomingRuns,
        fetchOne,
        updateOne,
        removeOne,
        performActionOne,
        fetchHistory,
        fetchUpcoming,
        clearCurrent,
        clearErrors,
    ]);
};